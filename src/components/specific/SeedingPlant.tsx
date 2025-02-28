'use client'
import React from 'react'
import Lottie, { LottieRefCurrentProps } from 'lottie-react'
import seedingPlantLottie from '../../../public/seedingplant'

const SeedingPlant: React.FC = () => {

  const lottieRef = React.useRef<LottieRefCurrentProps | null>(null);

  const handleMouseEnter = () => {
    if (lottieRef.current) {
      lottieRef.current.goToAndPlay(0, true);
    }
  }

  return (
    <div className='inline-block cursor-pointer' onMouseEnter={() => handleMouseEnter()}>
      <Lottie lottieRef={lottieRef} animationData={seedingPlantLottie} autoPlay={true} loop={false} className="inline-block h-4 w-4 ml-2" />
    </div>
  )
}

export default SeedingPlant
