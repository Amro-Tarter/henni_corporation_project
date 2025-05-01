import React from 'react';

const Post = ({ text, author, media }) => {
  return (
    <div className="bg-white p-4 shadow-md mb-4 rounded-lg">
      <div className="flex items-center gap-2 mb-3">
        <img 
          src={author.avatar || '/default-avatar.png'} 
          alt={author.name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <h3 className="font-bold">{author.name}</h3>
      </div>
      
      {text && <p className="mb-3">{text}</p>}
      
      {media && (
        <div className="mt-2 rounded-lg overflow-hidden">
          {media.type === 'image' ? (
            <img 
              src={media.url} 
              alt="Post media" 
              className="w-full max-h-96 object-contain"
            />
          ) : (
            <video 
              src={media.url} 
              controls 
              className="w-full max-h-96"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Post;