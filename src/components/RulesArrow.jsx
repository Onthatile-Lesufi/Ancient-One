import ArrowDown from '../assets/ArrowDown.png'

export default function RulesArrow(){
    return(
        <div className='items-center justify-center flex flex-col'>
            <p className="font-jersey text-white text-4xl">RULES</p>
            <div  style={{ backgroundImage: `url(${ArrowDown})` }} className="h-[78px] aspect-[1/1] bg-cover bg-center bg-no-repeat"></div>
        </div>
    )
}