import React from 'react'
import { useTheme } from 'next-themes'
import { FaMoon } from "react-icons/fa";
import { ImSun } from 'react-icons/im';

const ToggleTheme = () => {

    const { theme, setTheme } = useTheme()

  return (
    <div>
      <button className='flex items-center gap-1' 
                    onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            >
              {theme === 'light' ? <ImSun/> : <FaMoon/>}
        </button>
    </div>
  )
}

export default ToggleTheme
