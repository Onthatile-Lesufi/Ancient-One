import logoPng from '../assets/Logo.png'

export default function Logo(){
    return(
        <div className='h-[175px] aspect-[750/242] bg-cover bg-center bg-no-repeat'>
            <img src={logoPng} alt="Logo" className="w-full h-full object-fill"/>
        </div>
    );
}