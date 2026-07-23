import EnvironmentGraphic from '../assets/EnvironmentGraphic.png'
import MapAndMovementGraphic from '../assets/MapAndMovementGraphic.png'
import Portal from '../assets/Portal.png'
import SpecialItemGraphic from '../assets/SpecialItemGraphic.png'
import StartBtnBg from '../assets/StartBtnBg.png'
import CardBackground from '../assets/CardBackground.png';

export default function DashSection2(){
    return(
        <div className='bg-ancient-one-blue flex flex-col'>

            <div className='flex flex-row gap-x-[190px] p-24'>

                <div className='flex flex-row gap-x-2'>
                    <div  
                        style={{ backgroundImage: `url(${EnvironmentGraphic})` }} 
                        className="w-[322px] h-[128px] aspect-[1/1] bg-cover bg-center bg-no-repeat">
                    </div>

                    <div className='text-white font-jersey'>
                        <h1 className='text-3xl'>1. Tools & Environment</h1>
                        <p className='text-2xl pl-6 pt-2'>Player has to go to vaporised area to get tools.</p>
                    </div>
                </div>

                <div className='flex flex-row-reverse gap-x-3'>
                    <div  
                        style={{ backgroundImage: `url(${SpecialItemGraphic})` }} 
                        className="w-[322px] h-[128px] aspect-[1/1] bg-cover bg-center bg-no-repeat">
                    </div>

                    <div className='text-white font-jersey'>
                        <h1 className='text-3xl'>2. SPECIALISED VAPORISED ITEM</h1>
                        <p className='text-2xl pl-6 pt-2'>Player cannot cross the split unless they have the specialised vaporised item.</p>
                    </div>
                </div>
            </div>

            <div className='flex flex-row gap-x-[190px] p-24'>

                <div style={{ backgroundImage: `url(${CardBackground})` }} className='flex flex-row items-center justify-center gap-x-2 w-[600px] aspect-[557/220] bg-cover bg-center bg-no-repeat pl-5 '>
                    <div  
                        style={{ backgroundImage: `url(${Portal})` }} 
                        className="w-[85px] h-[85px] aspect-[1/1] bg-cover bg-center bg-no-repeat items-center">
                    </div>

                    <div className='text-white font-jersey'>
                        <h1 className='text-3xl'>3. Crossing and Portals</h1>
                        <p className='text-2xl pl-6 pt-2'>Player can only cross the split once using specialised item. From there the portals need to be used.</p>
                    </div>
                </div>

                <div className='flex flex-row gap-x-3'>
                    <div  
                        style={{ backgroundImage: `url(${MapAndMovementGraphic})` }} 
                        className="w-[322px] h-[128px] aspect-[1/1] bg-cover bg-center bg-no-repeat">
                    </div>

                    <div className='text-white font-jersey'>
                        <h1 className='text-3xl'>4. MAP & MOVEMENT</h1>
                        <p className='text-2xl pl-6 pt-2'>Player roles a dice to move and to search.</p>
                    </div>
                </div>
            </div>

        </div>
    )
}