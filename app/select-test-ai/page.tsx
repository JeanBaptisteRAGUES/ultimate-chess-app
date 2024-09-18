'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import Image, { StaticImageData } from 'next/image';
import { Behaviour, BotDescription, botsInfo } from '../bots-ai/BotsAI';
import { GiBulletBill } from 'react-icons/gi';
import { SiStackblitz } from 'react-icons/si';
import { LuAlarmClock } from 'react-icons/lu';
import { IoHourglassOutline } from 'react-icons/io5';
import { IoInfiniteSharp } from 'react-icons/io5';
import { SiLichess } from 'react-icons/si';
//import { SiChessdotcom } from 'react-icons/si';
import { FaChessPawn } from 'react-icons/fa';

import human_pp from "@/public/Bots_images/chess3d_human.jpg";
/* import indianKing_pp from "@/public/Bots_images/chess3d_indian-king.jpg";
import cowLover_pp from "@/public/Bots_images/chess3d_cow-lover.jpg";
import hippo_pp from "@/public/Bots_images/chess3d_hippo.jpg";
import stockfishOnly_pp from "@/public/Bots_images/chess3d_stockfish-only.jpg";
import pawnsPusher_pp from "@/public/Bots_images/chess3d_pawns-pusher.jpg";
import shy_pp from "@/public/Bots_images/chess3d_shy.jpg";
import blundering_pp from "@/public/Bots_images/chess3d_blundering.jpg";
import drawish_pp from "@/public/Bots_images/chess3d_drawish.jpg";
import exchangesLover_pp from "@/public/Bots_images/chess3d_exchanges-lover.jpg";
import exchangesHater_pp from "@/public/Bots_images/chess3d_exchanges-hater.jpg";
import queenPlayer_pp from "@/public/Bots_images/chess3d_queen-player.jpg";
import castleDestroyer_pp from "@/public/Bots_images/chess3d_castle-destroyer.jpg";
import chessableMaster_pp from "@/public/Bots_images/chess3d_chessable-master.jpg";
import autodidacte_pp from "@/public/Bots_images/chess3d_autodidacte.jpg";
import randomPlayer_pp from "@/public/Bots_images/chess3d_random.jpg";
import semiRandom_pp from "@/public/Bots_images/chess3d_semi-random.jpg";
import botezGambit_pp from "@/public/Bots_images/chess3d_botez-gambit.jpg";
import copycat_pp from "@/public/Bots_images/chess3d_copycat.jpg";
import bongcloud_pp from "@/public/Bots_images/chess3d_bongcloud.jpg";
import gambitFanatic_pp from "@/public/Bots_images/chess3d_gambit-fanatic.jpg";
import stonewall_pp from "@/public/Bots_images/chess3d_stone-wall.jpg";
import dragon_pp from "@/public/Bots_images/chess3d_dragon.jpg";
import caroLondon_pp from "@/public/Bots_images/chess3d_caro-london.jpg"; */


/*TODO: Choix difficulté: [
    'Beginner': pawnIcon, 
    'Casual': knightIcon, 
    'Intermediate': bishopIcon,
    'Advanced': rookIcon,
    'Master': queenIcon,
    'Maximum': kingIcon,
    ] */

// TODO: Liste des bots

/* const botsInfo = new Map<Behaviour, BotDescription>([
    ['human', {name: 'Judith', description: "Judith joue comme un humain et fera les mêmes erreurs qu'un humain de même Élo." }],
    ['stockfish-only', {name: 'Stockfish', description: "Stockfish s'adapte au niveau du joueur mais n'aura pas un comportement humain."}],
    ['indian-king', {name: 'Radjah', description: "Radjah joue tout le temps l'ouverture Est-Indienne, que ce soit avec les blancs ou les noirs"}],
    ['auto-didacte', {name: 'Emma', description: "Emma a toujours aimé tout apprendre par elle même. Ses connaissances dans les ouvertures sont très limitées mais elle se débrouille bien dans le milieu de jeu."}],
    ['blundering', {name: 'Worstfish', description: "Ce devait être le moteur d'échecs le plus performant au monde.. Malheureusement à cause d'une erreur de signe dans son code binaire, il ne joue que les pires coups de la position."}],
    ['bongcloud', {name: 'Hika', description: "Hika sait que dans les finales, il est important de mettre son roi au centre. Alors pourquoi perdre du temps et ne pas le faire dès l'ouverture ?"}],
    ['botez-gambit', {name: 'Andrea', description: "Andrea se considère comme une reine et n'aime pas partager sa place. C'est pour celà qu'elle aime sacrifier sa reine en début de partie car il ne peut n'y en avoir qu'une !"}],
    ['caro-london', {name: 'Henry', description: "Henry aime les ouvertures solides quite à renoncer à challenger son adversaire. Il joue le système de Londres avec les blancs et la caro-kann ou la slav avec les noirs."}],
    ['castle-destroyer', {name: 'Brutus', description: "Brutus aime la bagarre et n'est pas là pour conséder la nulle ! Il n'hésitera pas à envoyer des marées de pions sur le roque adverse voir à sacrifier une pièce pour attaquer votre roi, même si le sacrifice est douteux !"}],
    ['chessable-master', {name: 'Jenna', description: "Jenna est une femme très studieuse. Elle collectionne les cours Chessable sur les ouvertures des plus grands maîtres d'échecs ! Malheureusement, une fois sortie de la théorie elle aura un peu plus de mal à trouver les bons coups."}],
    ['copycat', {name: 'Mr. Mime', description: "Mr. Mime a une technique simple pour ne pas s'embêter à apprendre les coups dans l'ouverture: il jouera de façon symétrique jusqu'à pousser l'adversaire à l'erreur."}],
    ['cow-lover', {name: 'Bernadette', description: "Bernadette est la première vache au monde a avoir appris à jouer aux échecs. Elle jouera la Cow opening que ce soit avec les blancs ou avec les noirs."}],
    ['dragon', {name: 'Pyro', description: "Pyro aime prendre le centre avec un pion de l'aile et placer son fou en fianchetto pour qu'il puisse cracher ses flammes tel un dragon !"}],
    ['drawish', {name: 'François', description: "François est un homme ennuyant, avec un boulot ennuyant et une femme qui le trompe. Il compte bien vous entrainer dans sa vie insipide en jouant des positions les plus égales possibles."}],
    ['stonewall', {name: 'Golem', description: "Golem aime construire un mur de pion impénétrable et solide comme la roche. C'est donc tout naturellement qu'il joue l'ouverture stonewall avec les blancs comme avec les noirs."}],
    ['shy', {name: 'Lucie', description: "Lucie est timide et a peur de trop avancer ses pièces de peur de se les faire manger. Elle essaiera d'avancer ses pièces le moins possible dans le camp adverse."}],
    ['semi-random', {name: 'Georges Sr.', description: "Georges Sr. a plus d'expérience que son fils. Il joue des coups aléatoires mais sait comment les captures marchent aux échecs et n'hésitera pas à en faire s'il en a la possibilité."}],
    ['random-player', {name: 'Georges Jr.', description: "Georges Jr. est un singe à qui on a appris à jouer aux échecs. Enfin 'appris' est un bien grand mot, il sait comment les pièces se déplacent mais à part ça ses coups sont totalement aléatoires !"}],
    ['queen-player', {name: 'Martin', description: "Martin sait que la Dame est la pièce la plus forte. C'est donc pour ça qu'il essaiera de la jouer le plus tôt possible dans l'ouverture."}],
    ['pawn-pusher', {name: 'Lucas', description: "Lucas sait que les pions valent moins que les pièces. C'est pour ça qu'il aime les envoyer au combat tout en laissant ses pièces à l'abris dans son camp."}],
    ['gambit-fanatic', {name: 'Joker', description: "Joker aime sortir ses adversaires des sentiers battus et les entrainer dans les profondeurs obscures de la foret. Il ne vous laissera aucun répis et vous donnera du fil à retordre dès l'ouverture avec des gambits agressifs !"}],
    ['fianchetto-sniper', {name: 'Hippo', description: "Ne vous fiez pas à l'apparente tranquilité de l'hippopotame, il peut se réveler être un animal très dangereux et agressif. Il en va de même pour l'ouverture Hippopotamus !"}],
    ['exchanges-hater', {name: 'Emmeline', description: "Emmeline est de nature pacifiste et évitera le plus possible les échanges de pièces"}],
    ['exchanges-lover', {name: 'Jason', description: "Jason aime l'action et cherchera le plus possible à capturer les pièces adverses."}]

]); */

const INFINITE_SYMBOL = '∞';

const SelectTestAI = () => {
    const [elo, setElo] = useState<number>(1500);
    const [behaviour, setBehaviour] = useState<Behaviour>('human');
    const [timeControl, setTimeControl] = useState('10+0');
    //const [botPP, setBotPP] = useState<StaticImageData>(human_pp);

    const botInfosComponent = 
        <div className='flex flex-row justify-around items-center flex-wrap gap-2 py-5 w-full bg-cyan-900 sticky top-0 left-0 right-0' >
            <p className='w-full md:w-1/2 flex justify-center items-center text-xl font-semibold text-white'>Jouer en {timeControl === 'infinite' ? INFINITE_SYMBOL : timeControl} contre..</p>
            <span className=' w-full md:w-1/2 flex justify-center items-center rounded' >
                <Image
                    src={botsInfo.get(behaviour)?.image || human_pp}
                    alt="Picture of the author"
                    width={150}
                    height={150}
                    // blurDataURL="data:..." automatically provided
                    placeholder="blur" // Optional blur-up while loading
                />
            </span>
            <p className='w-full md:w-1/2 flex justify-center items-center text-lg font-semibold text-white'>{botsInfo.get(behaviour)?.name + ' (' + elo + ')'}</p>
            <p className='w-full md:w-1/2 flex justify-center items-center mx-5 text-md font-normal text-white'>{botsInfo.get(behaviour)?.description}</p>
        </div>

    const difficultyComponent =
        <div className='flex flex-row justify-around items-center flex-wrap w-full' >
            <input className=' bg-slate-600 text-white' type='number' placeholder='Bot Élo' onChange={(e) => setElo(e.target.value as any as number)}/>
        </div>

    const defaultBotsComponent =
        <div className='flex flex-row justify-center items-center flex-wrap w-full md:w-1/3 mt-2 px-2 gap-10' >
            <div onClick={() => {setBehaviour('human')}} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer rounded border-4' style={{borderColor: behaviour === 'human' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center rounded' >
                    <Image
                        src={botsInfo.get('human')?.image || human_pp}
                        alt="Picture of the author"
                        width={150}
                        height={150}
                        // blurDataURL="data:..." automatically provided
                        placeholder="blur" // Optional blur-up while loading
                    />
                </span>
            </div>
            <div onClick={() => {setBehaviour('stockfish-only')}} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer rounded border-4' style={{borderColor: behaviour === 'stockfish-only' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center rounded' >
                    <Image
                        src={botsInfo.get('stockfish-only')?.image || human_pp}
                        alt="Picture of the author"
                        width={150}
                        height={150}
                        // blurDataURL="data:..." automatically provided
                        placeholder="blur" // Optional blur-up while loading
                    />
                </span>
            </div>
        </div>

    const gimmickBotsComponent = 
        <div className='flex flex-row justify-center items-center flex-wrap w-full md:w-1/3 mt-2 px-2 gap-10' >
            <div onClick={() => {setBehaviour('pawn-pusher')}} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer rounded border-4' style={{borderColor: behaviour === 'pawn-pusher' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center rounded' >
                    <Image
                        src={botsInfo.get('pawn-pusher')?.image || human_pp}
                        alt="Picture of the author"
                        width={150}
                        height={150}
                        // blurDataURL="data:..." automatically provided
                        placeholder="blur" // Optional blur-up while loading
                    />
                </span>
            </div>
            <div onClick={() => {setBehaviour('shy')}} className=' h-[110px] w-[110px] flex flex-col justify-start items-center  cursor-pointer rounded border-4' style={{borderColor: behaviour === 'shy' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }} >
                <span className=' w-full h-full flex justify-center items-center rounded' >
                    <Image
                        src={botsInfo.get('shy')?.image || human_pp}
                        alt="Picture of the author"
                        width={150}
                        height={150}
                        // blurDataURL="data:..." automatically provided
                        placeholder="blur" // Optional blur-up while loading
                    />
                </span>
            </div>
            <div onClick={() => {setBehaviour('blundering')}} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer rounded border-4' style={{borderColor: behaviour === 'blundering' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }} >
                <span className=' w-full h-full flex justify-center items-center rounded' >
                    <Image
                        src={botsInfo.get('blundering')?.image || human_pp}
                        alt="Picture of the author"
                        width={150}
                        height={150}
                        // blurDataURL="data:..." automatically provided
                        placeholder="blur" // Optional blur-up while loading
                    />
                </span>
            </div>
            <div onClick={() => {setBehaviour('drawish')}} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer rounded border-4' style={{borderColor: behaviour === 'drawish' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center rounded' >
                    <Image
                        src={botsInfo.get('drawish')?.image || human_pp}
                        alt="Picture of the author"
                        width={150}
                        height={150}
                        // blurDataURL="data:..." automatically provided
                        placeholder="blur" // Optional blur-up while loading
                    />
                </span>
            </div>
            <div onClick={() => {setBehaviour('exchanges-lover')}} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer rounded border-4' style={{borderColor: behaviour === 'exchanges-lover' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center rounded' >
                    <Image
                        src={botsInfo.get('exchanges-lover')?.image || human_pp}
                        alt="Picture of the author"
                        width={150}
                        height={150}
                        // blurDataURL="data:..." automatically provided
                        placeholder="blur" // Optional blur-up while loading
                    />
                </span>
            </div>
            <div onClick={() => {setBehaviour('exchanges-hater')}} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer rounded border-4' style={{borderColor: behaviour === 'exchanges-hater' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center rounded' >
                    <Image
                        src={botsInfo.get('exchanges-hater')?.image || human_pp}
                        alt="Picture of the author"
                        width={150}
                        height={150}
                        // blurDataURL="data:..." automatically provided
                        placeholder="blur" // Optional blur-up while loading
                    />
                </span>
            </div>
            <div onClick={() => {setBehaviour('queen-player')}} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer rounded border-4' style={{borderColor: behaviour === 'queen-player' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }} >
                <span className=' w-full h-full flex justify-center items-center rounded' >
                    <Image
                        src={botsInfo.get('queen-player')?.image || human_pp}
                        alt="Picture of the author"
                        width={150}
                        height={150}
                        // blurDataURL="data:..." automatically provided
                        placeholder="blur" // Optional blur-up while loading
                    />
                </span>
            </div>
            <div onClick={() => {setBehaviour('castle-destroyer')}} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer rounded border-4' style={{borderColor: behaviour === 'castle-destroyer' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center rounded' >
                    <Image
                        src={botsInfo.get('castle-destroyer')?.image || human_pp}
                        alt="Picture of the author"
                        width={150}
                        height={150}
                        // blurDataURL="data:..." automatically provided
                        placeholder="blur" // Optional blur-up while loading
                    />
                </span>
            </div>
            <div onClick={() => {setBehaviour('chessable-master')}} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer rounded border-4' style={{borderColor: behaviour === 'chessable-master' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center rounded' >
                    <Image
                        src={botsInfo.get('chessable-master')?.image || human_pp}
                        alt="Picture of the author"
                        width={150}
                        height={150}
                        // blurDataURL="data:..." automatically provided
                        placeholder="blur" // Optional blur-up while loading
                    />
                </span>
            </div>
            <div onClick={() => {setBehaviour('auto-didacte')}} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer rounded border-4' style={{borderColor: behaviour === 'auto-didacte' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center rounded' >
                    <Image
                        src={botsInfo.get('auto-didacte')?.image || human_pp}
                        alt="Picture of the author"
                        width={150}
                        height={150}
                        // blurDataURL="data:..." automatically provided
                        placeholder="blur" // Optional blur-up while loading
                    />
                </span>
            </div>
            <div onClick={() => {setBehaviour('random-player')}} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer rounded border-4' style={{borderColor: behaviour === 'random-player' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center rounded' >
                    <Image
                        src={botsInfo.get('random-player')?.image || human_pp}
                        alt="Picture of the author"
                        width={150}
                        height={150}
                        // blurDataURL="data:..." automatically provided
                        placeholder="blur" // Optional blur-up while loading
                    />
                </span>
            </div>
            <div onClick={() => {setBehaviour('semi-random')}} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer rounded border-4' style={{borderColor: behaviour === 'semi-random' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center rounded' >
                    <Image
                        src={botsInfo.get('semi-random')?.image || human_pp}
                        alt="Picture of the author"
                        width={150}
                        height={150}
                        // blurDataURL="data:..." automatically provided
                        placeholder="blur" // Optional blur-up while loading
                    />
                </span>
            </div>
        </div>

    const openingBotsComponent = 
        <div className='flex flex-row justify-center items-center flex-wrap w-full md:w-1/3 mt-2 px-2 gap-10' >
            <div onClick={() => {setBehaviour('fianchetto-sniper')}} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer rounded border-4' style={{borderColor: behaviour === 'fianchetto-sniper' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center rounded' >
                    <Image
                        src={botsInfo.get('fianchetto-sniper')?.image || human_pp}
                        alt="Picture of the author"
                        width={150}
                        height={150}
                        // blurDataURL="data:..." automatically provided
                        placeholder="blur" // Optional blur-up while loading
                    />
                </span>
            </div>
            <div onClick={() => {setBehaviour('botez-gambit')}} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer rounded border-4' style={{borderColor: behaviour === 'botez-gambit' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }} >
                <span className=' w-full h-full flex justify-center items-center rounded' >
                    <Image
                        src={botsInfo.get('botez-gambit')?.image || human_pp}
                        alt="Picture of the author"
                        width={150}
                        height={150}
                        // blurDataURL="data:..." automatically provided
                        placeholder="blur" // Optional blur-up while loading
                    />
                </span>
            </div>
            <div onClick={() => {setBehaviour('copycat')}} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer rounded border-4' style={{borderColor: behaviour === 'copycat' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center rounded' >
                    <Image
                        src={botsInfo.get('copycat')?.image || human_pp}
                        alt="Picture of the author"
                        width={150}
                        height={150}
                        // blurDataURL="data:..." automatically provided
                        placeholder="blur" // Optional blur-up while loading
                    />
                </span>
            </div>
            <div onClick={() => {setBehaviour('bongcloud')}} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer rounded border-4' style={{borderColor: behaviour === 'bongcloud' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }} >
                <span className=' w-full h-full flex justify-center items-center rounded' >
                    <Image
                        src={botsInfo.get('bongcloud')?.image || human_pp}
                        alt="Picture of the author"
                        width={150}
                        height={150}
                        // blurDataURL="data:..." automatically provided
                        placeholder="blur" // Optional blur-up while loading
                    />
                </span>
            </div>
            <div onClick={() => {setBehaviour('gambit-fanatic')}} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer rounded border-4' style={{borderColor: behaviour === 'gambit-fanatic' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }} >
                <span className=' w-full h-full flex justify-center items-center rounded' >
                    <Image
                        src={botsInfo.get('gambit-fanatic')?.image || human_pp}
                        alt="Picture of the author"
                        width={150}
                        height={150}
                        // blurDataURL="data:..." automatically provided
                        placeholder="blur" // Optional blur-up while loading
                    />
                </span>
            </div>
            <div onClick={() => {setBehaviour('cow-lover')}} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer rounded border-4' style={{borderColor: behaviour === 'cow-lover' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center rounded' >
                    <Image
                        src={botsInfo.get('cow-lover')?.image || human_pp}
                        alt="Picture of the author"
                        width={150}
                        height={150}
                        // blurDataURL="data:..." automatically provided
                        placeholder="blur" // Optional blur-up while loading
                    />
                </span>
            </div>
            <div onClick={() => {setBehaviour('indian-king')}} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer rounded border-4' style={{borderColor: behaviour === 'indian-king' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center rounded' >
                    <Image
                        src={botsInfo.get('indian-king')?.image || human_pp}
                        alt="Picture of the author"
                        width={150}
                        height={150}
                        // blurDataURL="data:..." automatically provided
                        placeholder="blur" // Optional blur-up while loading
                    />
                </span>
            </div>
            <div onClick={() => {setBehaviour('stonewall')}} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer rounded border-4' style={{borderColor: behaviour === 'stonewall' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center rounded' >
                    <Image
                        src={botsInfo.get('stonewall')?.image || human_pp}
                        alt="Picture of the author"
                        width={150}
                        height={150}
                        // blurDataURL="data:..." automatically provided
                        placeholder="blur" // Optional blur-up while loading
                    />
                </span>
            </div>
            <div onClick={() => {setBehaviour('dragon')}} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer rounded border-4' style={{borderColor: behaviour === 'dragon' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center rounded' >
                    <Image
                        src={botsInfo.get('dragon')?.image || human_pp}
                        alt="Picture of the author"
                        width={150}
                        height={150}
                        // blurDataURL="data:..." automatically provided
                        placeholder="blur" // Optional blur-up while loading
                    />
                </span>
            </div>
            <div onClick={() => {setBehaviour('caro-london')}} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer rounded border-4' style={{borderColor: behaviour === 'caro-london' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center rounded' >
                    <Image
                        src={botsInfo.get('caro-london')?.image || human_pp}
                        alt="Picture of the author"
                        width={150}
                        height={150}
                        // blurDataURL="data:..." automatically provided
                        placeholder="blur" // Optional blur-up while loading
                    />
                </span>
            </div>
        </div>

/*     ['1+0', {startingTime: 60, increment: 0}],
    ['3+0', {startingTime: 180, increment: 0}],
    ['3+2', {startingTime: 180, increment: 2}],
    ['10+0', {startingTime: 600, increment: 0}],
    ['15+10', {startingTime: 900, increment: 10}],
    ['30+20', {startingTime: 1800, increment: 20}],
    ['90+30', {startingTime: 5400, increment: 30}], */
    const timeControlComponent =
        <div className='flex mt-10 flex-row justify-around items-center flex-wrap w-full' >
            <div onClick={() => setTimeControl('1+0')} className=' h-[150px] md:h-[110px] w-[150px] md:w-[110px] flex flex-col justify-center items-center cursor-pointer' style={{color: timeControl === '1+0' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <GiBulletBill size={100} />
                <span className=' w-full h-[10px] flex justify-center items-center' >1+0</span>
            </div>
            <div onClick={() => setTimeControl('3+0')} className=' h-[150px] md:h-[110px] w-[150px] md:w-[110px] flex flex-col justify-center items-center cursor-pointer' style={{color: timeControl === '3+0' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <SiStackblitz size={100} />
                <span className=' w-full h-[10px] flex justify-center items-center' >3+0</span>
            </div>
            <div onClick={() => setTimeControl('3+2')} className=' h-[150px] md:h-[110px] w-[150px] md:w-[110px] flex flex-col justify-center items-center cursor-pointer' style={{color: timeControl === '3+2' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <SiStackblitz size={100} />
                <span className=' w-full h-[10px] flex justify-center items-center' >3+2</span>
            </div>
            <div onClick={() => setTimeControl('10+0')} className=' h-[150px] md:h-[110px] w-[150px] md:w-[110px] flex flex-col justify-center items-center cursor-pointer' style={{color: timeControl === '10+0' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <LuAlarmClock size={100} />
                <span className=' w-full h-[10px] flex justify-center items-center' >10+0</span>
            </div>
            <div onClick={() => setTimeControl('15+10')} className=' h-[150px] md:h-[110px] w-[150px] md:w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: timeControl === '15+10' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <LuAlarmClock size={100} />
                <span className=' w-full h-[10px] flex justify-center items-center' >15+10</span>
            </div>
            <div onClick={() => setTimeControl('30+20')} className=' h-[150px] md:h-[110px] w-[150px] md:w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: timeControl === '30+20' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <LuAlarmClock size={100} />
                <span className=' w-full h-[10px] flex justify-center items-center' >30+20</span>
            </div>
            <div onClick={() => setTimeControl('90+30')} className=' h-[150px] md:h-[110px] w-[150px] md:w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: timeControl === '90+30' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <IoHourglassOutline size={100} />
                <span className=' w-full h-[10px] flex justify-center items-center' >90+30</span>
            </div>
            <div onClick={() => setTimeControl('infinite')} className=' h-[150px] md:h-[110px] w-[150px] md:w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: timeControl === 'infinite' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <IoInfiniteSharp size={100} />
                <span className=' w-full h-[10px] flex justify-center items-center' >Infini</span>
            </div>
        </div>


    return (
        <div className="flex flex-col justify-start items-center bg-cyan-900 h-[95vh] w-full overflow-auto" >
            {botInfosComponent}
            <div className=' w-full md:pl-10 flex justify-center md:justify-center items-center text-2xl font-semibold text-white mt-5 mb-2' >Difficulté:</div>
            {difficultyComponent}
            <div className=' w-full mt-20 md:pl-10 flex flex-col justify-center md:justify-center items-center font-semibold text-white'>
                <div className=' w-full flex justify-center md:justify-center items-center text-2xl mb-5' >Default Bots:</div>
            </div >
            {defaultBotsComponent}
            <div className=' w-full mt-20 md:pl-10 flex flex-col justify-center md:justify-center items-center font-semibold text-white'>
                <div className=' w-full flex justify-center md:justify-center items-center text-2xl  mb-5' >Gimmick Bots:</div>
            </div >
            {gimmickBotsComponent}
            <div className=' w-full mt-20 md:pl-10 flex flex-col justify-center md:justify-center items-center font-semibold text-white'>
                <div className=' w-full flex justify-center md:justify-center items-center text-2xl  mb-5' >Openings Bots:</div>
            </div >
            {openingBotsComponent}
            <div className=' w-full mt-20 md:pl-10 flex justify-center md:justify-center items-center text-2xl font-semibold text-white' >Cadence:</div>
            {timeControlComponent}
            <Link
                className=' text-white hover:text-cyan-400 cursor-pointer text-3xl font-bold my-20 '
                href = {{
                pathname: '/test-ai',
                query: {
                    elo: elo,
                    behaviour: behaviour,
                    timeControl: timeControl,
                }
                }}
            >
                Jouer
            </Link>
        </div>
    )
}

export default SelectTestAI;