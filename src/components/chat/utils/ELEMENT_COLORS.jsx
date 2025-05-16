import AirIcon from '@mui/icons-material/Air';
import WaterIcon from '@mui/icons-material/WaterDrop';
import FireIcon from '@mui/icons-material/Whatshot';
import EarthIcon from '@mui/icons-material/Nature';
import MetalIcon from '@mui/icons-material/Build';

export const ELEMENT_COLORS = {
    fire: {
      primary: '#ff4500',
      hover: '#e63e00',
      light: '#fff0e6',
      darkHover: '#b33000',
      background: '#fff7f2',
      icon: <FireIcon style={{color: '#ff4500'}} />
    },
    earth: {
      primary: '#228B22',
      hover: '#1e7a1e',
      light: '#f5ede6',
      darkHover: '#5e2f0d',
      background: '#fcf8f3',
      icon: <EarthIcon style={{color: '#228B22'}} />
    },
    metal: {
      primary: '#c0c0c0',
      hover: '#a8a8a8',
      light: '#f5f5f5',
      darkHover: '#808080',
      background: '#fafafa',
      icon: <MetalIcon style={{color: '#c0c0c0'}} />
    },
    water: {
      primary: '#1e90ff',
      hover: '#187bdb',
      light: '#e6f2ff',
      darkHover: '#0066cc',
      background: '#f3f8ff',
      icon: <WaterIcon style={{color: '#1e90ff'}} />
    },
    air: {
      primary: '#87ceeb',
      hover: '#76bede',
      light: '#eaf8ff',
      darkHover: '#5ca8c4',
      background: '#f7fcff',
      icon: <AirIcon style={{color: '#87ceeb'}} />
    }
  };