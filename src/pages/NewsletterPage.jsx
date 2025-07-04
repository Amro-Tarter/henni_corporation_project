import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, updateDoc, limit, startAfter, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/config/firbaseConfig';
import { useUser } from '@/hooks/useUser';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Newspaper, PlusCircle, Calendar, User, MapPin, FileText, Image, X, Edit2, Trash2, ChevronDown, ChevronUp, Tag, Upload, Link, Camera } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/layout/Layout';
const ITEMS_PER_PAGE = 5;

// Sample news data
const sampleNews = {
  title: "ברוכים הבאים לעיתון הנני!",
  body: `אנחנו שמחים להציג בפניכם את העיתון החדש של קהילת הנני. כאן תוכלו למצוא את כל החדשות, האירועים והעדכונים החשובים מהקהילה שלנו.

העיתון נועד להיות מקור מידע מרכזי לכל חברי הקהילה, ולאפשר לנו לשתף את החדשות והאירועים החשובים שמתרחשים סביבנו.

בקרוב נוסיף תכונות נוספות כמו:
• אפשרות להגיב לכתבות
• שיתוף כתבות ברשתות החברתיות
• התראות על כתבות חדשות
• ועוד...

אנחנו מזמינים אתכם להיות חלק פעיל בקהילה ולשתף את החדשות והעדכונים שלכם!`,
  summary: "הכירו את העיתון החדש של קהילת הנני - מקור המידע המרכזי לכל החדשות והאירועים בקהילה.",
  image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
  tags: ["חדשות", "קהילה", "הכרזה"]
};

export default function NewsletterPage() {
  const { user, loading } = useUser();
  const [newsletters, setNewsletters] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [form, setForm] = useState({ 
    title: '', 
    body: '', 
    summary: '',
    image: '',
    imageFile: null,
    tags: []
  });
  const [submitting, setSubmitting] = useState(false);
  const [activeView, setActiveView] = useState('latest');
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentTag, setCurrentTag] = useState('all');
  const [imageMethod, setImageMethod] = useState('upload'); // 'upload' or 'url'
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Only active admins can post
  const isAdmin = user?.role === 'admin';

  // Add sample news if no articles exist
  const addSampleNews = async () => {
    try {
      const q = query(collection(db, 'newsletters'));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        await addDoc(collection(db, 'newsletters'), {
          ...sampleNews,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          author: "מערכת",
          authorId: "system",
          authorElement: "מערכת",
          authorLocation: "הנני"
        });
        toast.success("נוספה כתבת דוגמה");
      }
    } catch (error) {
      console.error("Error adding sample news:", error);
    }
  };

  // Listen for newsletters in real time
  useEffect(() => {
    const q = query(
      collection(db, 'newsletters'),
      orderBy('createdAt', 'desc'),
      limit(ITEMS_PER_PAGE)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const news = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNewsletters(news);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === ITEMS_PER_PAGE);
      
      // Add sample news if no articles exist
      if (news.length === 0) {
        addSampleNews();
      }
    });

    return unsubscribe;
  }, []);

  // Load more newsletters
  const loadMore = async () => {
    if (!lastVisible || !hasMore || loadingMore) return;
    
    setLoadingMore(true);
    try {
      const q = query(
        collection(db, 'newsletters'),
        orderBy('createdAt', 'desc'),
        startAfter(lastVisible),
        limit(ITEMS_PER_PAGE)
      );
      
      const snapshot = await getDocs(q);
      const moreNews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      setNewsletters(prev => [...prev, ...moreNews]);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === ITEMS_PER_PAGE);
    } catch (error) {
      toast.error("שגיאה בטעינת כתבות נוספות");
    } finally {
      setLoadingMore(false);
    }
  };

  // Form change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("הקובץ גדול מדי. גודל מקסימלי: 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("נא לבחור קובץ תמונה בלבד");
      return;
    }

    setForm(f => ({ ...f, imageFile: file }));

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Upload image to Firebase Storage
  const uploadImage = async (file, articleId) => {
    if (!file) return null;

    try {
      const filename = `newsletters/${articleId}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, filename);
      
      setUploading(true);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("שגיאה בהעלאת התמונה");
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Delete image from Firebase Storage
  const deleteImage = async (imageUrl) => {
    if (!imageUrl || !imageUrl.includes('firebase')) return;
    
    try {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  // Handle tag input
  const handleTagInput = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault();
      const newTag = e.target.value.trim();
      if (!form.tags.includes(newTag)) {
        setForm(f => ({ ...f, tags: [...f.tags, newTag] }));
      }
      e.target.value = '';
    }
  };

  // Remove tag
  const removeTag = (tagToRemove) => {
    setForm(f => ({ ...f, tags: f.tags.filter(tag => tag !== tagToRemove) }));
  };

  // Clear image
  const clearImage = () => {
    setForm(f => ({ ...f, image: '', imageFile: null }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) {
      toast.error("נא למלא את כל השדות החובה");
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl = form.image;

      // Handle image upload if file is selected
      if (form.imageFile) {
        const tempId = editMode ? selectedNews.id : Date.now().toString();
        imageUrl = await uploadImage(form.imageFile, tempId);
        
        if (!imageUrl) {
          setSubmitting(false);
          return;
        }
      }

      const newsData = {
        title: form.title,
        body: form.body,
        summary: form.summary || form.body.substring(0, 150) + '...',
        image: imageUrl,
        tags: form.tags,
        createdAt: editMode ? selectedNews.createdAt : serverTimestamp(),
        updatedAt: serverTimestamp(),
        author: user.username || user.displayName || user.email || "מערכת",
        authorId: user.associated_id,
        authorElement: user.element || "",
        authorLocation: user.location || ""
      };

      if (editMode && selectedNews) {
        // Delete old image if it's being replaced
        if (selectedNews.image && selectedNews.image !== imageUrl && selectedNews.image.includes('firebase')) {
          await deleteImage(selectedNews.image);
        }
        
        await updateDoc(doc(db, 'newsletters', selectedNews.id), newsData);
        toast.success("הכתבה עודכנה בהצלחה!");
      } else {
        await addDoc(collection(db, 'newsletters'), newsData);
        toast.success("הכתבה פורסמה בהצלחה!");
      }

      setForm({ title: '', body: '', summary: '', image: '', imageFile: null, tags: [] });
      setImagePreview(null);
      setOpen(false);
      setEditMode(false);
      setSelectedNews(null);
    } catch (err) {
      toast.error("שגיאה: " + err.message);
    }
    setSubmitting(false);
  };

  // Handle edit
  const handleEdit = (news) => {
    setSelectedNews(news);
    setForm({
      title: news.title,
      body: news.body,
      summary: news.summary || '',
      image: news.image || '',
      imageFile: null,
      tags: news.tags || []
    });
    setImagePreview(news.image || null);
    setImageMethod(news.image && !news.image.includes('firebase') ? 'url' : 'upload');
    setEditMode(true);
    setOpen(true);
  };

  // Handle delete
  const handleDelete = async (newsId) => {
    if (!window.confirm("האם אתה בטוח שברצונך למחוק כתבה זו?")) return;
    
    try {
      const newsToDelete = newsletters.find(n => n.id === newsId);
      if (newsToDelete?.image && newsToDelete.image.includes('firebase')) {
        await deleteImage(newsToDelete.image);
      }
      
      await deleteDoc(doc(db, 'newsletters', newsId));
      toast.success("הכתבה נמחקה בהצלחה");
    } catch (err) {
      toast.error("שגיאה במחיקת הכתבה");
    }
  };

  // Reset form when dialog closes
  const handleDialogClose = (open) => {
    if (!open) {
      setForm({ title: '', body: '', summary: '', image: '', imageFile: null, tags: [] });
      setImagePreview(null);
      setEditMode(false);
      setSelectedNews(null);
      setImageMethod('upload');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
    setOpen(open);
  };

  // Get all unique tags
  const allTags = [...new Set(newsletters.flatMap(n => n.tags || []))];

  // Filter newsletters by tag
  const filteredNewsletters = currentTag === 'all' 
    ? newsletters 
    : newsletters.filter(n => (n.tags || []).includes(currentTag));

  return (
    <Layout>
    <div className="bg-gradient-to-b from-blue-50 to-neutral-100 min-h-screen py-24 px-4 ">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Newspaper className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 tracking-tight mb-2">
            חדשות ועדכונים
          </h1>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            הישארו מעודכנים עם החדשות והעדכונים האחרונים מהקהילה שלנו
          </p>
          
          {isAdmin && (
            <Button 
              onClick={() => {
                setEditMode(false);
                setSelectedNews(null);
                setForm({ title: '', body: '', summary: '', image: '', imageFile: null, tags: [] });
                setImagePreview(null);
                setImageMethod('upload');
                setOpen(true);
              }}
              className="rounded-full shadow-md hover:shadow-lg transition-all"
              size="lg"
            >
              <PlusCircle className="mr-2 h-5 w-5" /> הוסף כתבה חדשה
            </Button>
          )}
        </div>

        {/* Tags Filter */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            <Badge 
              variant={currentTag === 'all' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setCurrentTag('all')}
            >
              הכל
            </Badge>
            {allTags.map(tag => (
              <Badge
                key={tag}
                variant={currentTag === tag ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setCurrentTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* News List */}
        <div className="space-y-8">
          {filteredNewsletters.length === 0 ? (
            <Card className="text-center border border-dashed py-12">
              <CardContent className="pt-6">
                <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-xl text-gray-500">עדיין לא פורסמו כתבות</p>
                {isAdmin && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setOpen(true)}
                  >
                    פרסם את הכתבה הראשונה
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              {filteredNewsletters.map(article => (
                <ArticleCard 
                  key={article.id} 
                  article={article}
                  isAdmin={isAdmin}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
              
              {hasMore && (
                <div className="flex justify-center mt-8">
                  <Button
                    variant="outline"
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="gap-2"
                  >
                    {loadingMore ? (
                      <>
                        <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        טוען...
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        טען עוד כתבות
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create/Edit Article Dialog */}
      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {editMode ? 'עריכת כתבה' : 'הוספת כתבה חדשה'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">כותרת הכתבה *</label>
              <Input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="הוסף כותרת מעניינת..."
                disabled={submitting}
                className="rounded-md"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="summary" className="text-sm font-medium">תקציר (אופציונלי)</label>
              <Textarea
                id="summary"
                name="summary"
                value={form.summary}
                onChange={handleChange}
                placeholder="הוסף תקציר קצר..."
                rows={2}
                disabled={submitting}
                className="rounded-md"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="body" className="text-sm font-medium">תוכן הכתבה *</label>
              <Textarea
                id="body"
                name="body"
                value={form.body}
                onChange={handleChange}
                placeholder="כתוב או הדבק את תוכן הכתבה כאן..."
                rows={8}
                disabled={submitting}
                className="rounded-md font-sans"
                required
              />
            </div>
            
            {/* Image Upload Section */}
            <div className="space-y-4">
              <label className="text-sm font-medium flex items-center gap-2">
                <Image className="h-4 w-4" /> תמונה (אופציונלי)
              </label>
              
              {/* Image Method Selection */}
              <Tabs value={imageMethod} onValueChange={setImageMethod} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    העלאת קובץ
                  </TabsTrigger>
                  <TabsTrigger value="url" className="flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    קישור URL
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="upload" className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      disabled={submitting || uploading}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={submitting || uploading}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    גודל מקסימלי: 5MB. פורמטים נתמכים: JPG, PNG, GIF, WebP
                  </p>
                </TabsContent>
                
                <TabsContent value="url" className="space-y-3">
                  <Input
                    name="image"
                    value={form.image}
                    onChange={handleChange}
                    placeholder="הכנס URL של תמונה..."
                    disabled={submitting}
                    className="rounded-md"
                  />
                  <p className="text-xs text-gray-500">
                    הכנס קישור ישיר לתמונה מהאינטרנט
                  </p>
                </TabsContent>
              </Tabs>

              {/* Image Preview */}
              {(imagePreview || (imageMethod === 'url' && form.image)) && (
                <div className="relative mt-2 border rounded-md overflow-hidden">
                  <img 
                    src={imagePreview || form.image} 
                    alt="תצוגה מקדימה" 
                    className="w-full h-40 object-cover"
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = "/placeholder-image.jpg";
                    }}
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full"
                    onClick={clearImage}
                    type="button"
                    disabled={submitting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  {uploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-white text-sm flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        מעלה תמונה...
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Tag className="h-4 w-4" /> תגיות (אופציונלי)
              </label>
              <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[40px]">
                {form.tags.map(tag => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removeTag(tag)}
                  >
                    {tag} <X className="h-3 w-3 mr-1" />
                  </Badge>
                ))}
                <Input
                  placeholder="הוסף תגית והקש Enter..."
                  onKeyDown={handleTagInput}
                  className="flex-1 min-w-[200px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  disabled={submitting}
                />
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => handleDialogClose(false)} 
                disabled={submitting || uploading} 
                type="button"
              >
                ביטול
              </Button>
              <Button 
                type="submit" 
                disabled={submitting || uploading} 
                className="gap-2"
              >
                {submitting || uploading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {uploading ? 'מעלה תמונה...' : editMode ? 'מעדכן...' : 'מפרסם...'}
                  </>
                ) : (
                  <>{editMode ? 'עדכן כתבה' : 'פרסם כתבה'}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
    </Layout>
  );
}

// Article Card Component
function ArticleCard({ article, isAdmin, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  
  // Get initials for avatar
  const getInitials = (name) => {
    if (!name || name === "מערכת") return "HN";
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300">
      {article.image && (
        <div className="w-full h-64 overflow-hidden">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.onerror = null; 
              e.target.src = "/placeholder-image.jpg";
            }}
          />
        </div>
      )}
      
      <CardContent className={`p-6 ${!article.image ? 'pt-6' : ''}`}>
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-3xl font-bold text-gray-900 leading-tight">
            {article.title}
          </h2>
          
          {isAdmin && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(article)}
                className="h-8 w-8"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(article.id)}
                className="h-8 w-8 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(article.author)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">
              {article.author || 'מערכת'}
            </span>
            <div className="flex items-center text-xs text-gray-500 gap-3">
              {article.createdAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {article.createdAt?.toDate?.().toLocaleString?.('he-IL', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                  }) || "עכשיו"}
                </span>
              )}
              
              {article.authorElement && (
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {article.authorElement}
                </span>
              )}
              
              {article.authorLocation && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {article.authorLocation}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {article.summary && !expanded && (
          <p className="text-gray-600 mb-4">{article.summary}</p>
        )}
        
        <div className={`prose max-w-none ${expanded ? '' : 'line-clamp-6'}`}>
          {article.body}
        </div>
        
        {(article.body.length > 300 || article.summary) && (
          <Button 
            variant="ghost" 
            className="mt-4 text-primary hover:text-primary/80"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                הצג פחות
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                קרא עוד...
              </>
            )}
          </Button>
        )}
      </CardContent>
      
      <CardFooter className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
        <div className="text-xs text-gray-500">
          {article.createdAt?.toDate?.().toLocaleString?.('he-IL', {
            hour: '2-digit', minute: '2-digit'
          }) || ""}
        </div>
        
        <div className="flex gap-2">
          {article.tags?.map(tag => (
            <Badge key={tag} variant="secondary">{tag}</Badge>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}