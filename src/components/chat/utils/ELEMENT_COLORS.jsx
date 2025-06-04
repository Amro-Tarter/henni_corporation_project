import AirIcon from '@mui/icons-material/Air';


export const ELEMENT_COLORS = {
    fire: {
      label: 'אש',
      primary: '#ff4500',
      hover: '#e63e00',
      light: '#fff0e6',
      darkHover: '#b33000',
      background: '#fff7f2',
      icon: '🔥'
    },
    earth: {
      label: 'אדמה',
      primary: '#228B22',
      hover: '#1e7a1e',
      light: '#f5ede6',
      darkHover: '#175c17',
      background: '#fcf8f3',
      icon: '🌱'
    },
    metal: {
      label: 'מתכת',
      primary: '#666666',
      hover: '#404040',
      light: '#e6e6e6',
      darkHover: '#333333',
      background: '#f0f0f0',
      icon: '⚒️'
    },
    water: {
      label: 'מים',
      primary: '#3b82f6',
      hover: '#6366f1',
      light: '#eef2ff',
      darkHover: '#265eb5',
      background: '#f5f8ff',
      icon: '💧'
    },
    air: {
      label: 'אוויר',
      primary: '#0ea5e9',
      hover: '#0284c7',
      light: '#ccf2ff',
      darkHover: '#026899',
      background: '#e6f9ff',
      icon: <AirIcon style={{color: '#0ea5e9'}} />
    },
    staff_mentor_admin: {
      primary: '#a83232',      // Rich warm red (less saturated than #7f1d1d)
      hover: '#922b21',        // Darker, deeper hover red
      light: '#fdecea',        // Very light red-tinted background
      darkHover: '#7f1d1d',    // The reference color (darkest tone)
      background: '#fff6f6',   // Soft light red background
      icon: '🔥'
    }
  };