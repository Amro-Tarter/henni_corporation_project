import AirIcon from '@mui/icons-material/Air';
import WaterIcon from '@mui/icons-material/WaterDrop';
import FireIcon from '@mui/icons-material/Whatshot';
import EarthIcon from '@mui/icons-material/Nature';
import MetalIcon from '@mui/icons-material/Build';

export const ELEMENT_COLORS = {
    fire: {
      label: 'אש',
      primary: '#ff4500',
      hover: '#e63e00',
      light: '#fff0e6',
      darkHover: '#b33000',
      background: '#fff7f2',
      icon: <FireIcon style={{color: '#ff4500'}} />
    },
    earth: {
      label: 'אדמה',
      primary: '#228B22',
      hover: '#1e7a1e',
      light: '#f5ede6',
      darkHover: '#5e2f0d',
      background: '#fcf8f3',
      icon: <EarthIcon style={{color: '#228B22'}} />
    },
    metal: {
      label: 'מתכת',
      primary: '#c0c0c0',
      hover: '#a8a8a8',
      light: '#f5f5f5',
      darkHover: '#808080',
      background: '#fafafa',
      icon: <MetalIcon style={{color: '#808080'}} />
    },
    water: {
      label: 'מים',
      primary: '#1e90ff',
      hover: '#187bdb',
      light: '#e6f2ff',
      darkHover: '#0066cc',
      background: '#f3f8ff',
      icon: <WaterIcon style={{color: '#1e90ff'}} />
    },
    air: {
      label: 'אוויר',
      primary: '#87ceeb',
      hover: '#76bede',
      light: '#eaf8ff',
      darkHover: '#5ca8c4',
      background: '#f7fcff',
      icon: <AirIcon style={{color: '#87ceeb'}} />
    },
    staff: {
      primary: '#a83232',      // Rich warm red (less saturated than #7f1d1d)
      hover: '#922b21',        // Darker, deeper hover red
      light: '#fdecea',        // Very light red-tinted background
      darkHover: '#7f1d1d',    // The reference color (darkest tone)
      background: '#fff6f6',   // Soft light red background
      icon: <FireIcon style={{ color: '#a83232' }} />, // Match primary
    }
  };