'use client'
import React from 'react'
import Lottie from 'lottie-react'
import seedingPlantLottie from '../../../../public/seedingplant'

const SeedingPlant: React.FC = () => {

  return (
    <>
      <Lottie animationData={seedingPlantLottie} autoPlay={true} loop={false} className="inline-block h-4 w-4 ml-2" />
    </>
  )
}

export default SeedingPlant
