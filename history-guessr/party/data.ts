export interface HistoricEvent{
    name: string;
    desc: string;
    img: string;
    year: number;
    long: number;
    lat: number;
  }
  
export const historicEvents: HistoricEvent[] = [
  /*
    {
      name: "Battle of Berlin",
      desc: "Soviet offensive and capture of the German capital",
      img: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Raising_a_flag_over_the_Reichstag_-_Restoration.jpg",
      year: 1945,
      long: 13.3762,
      lat: 52.5186
    },
    */
    {
      name: "Assassination of Archduke Franz Ferdinand",
      desc: "Assassination leading to World War I",
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/DC-1914-27-d-Sarajevo-cropped.jpg/1280px-DC-1914-27-d-Sarajevo-cropped.jpg",
      year: 1914,
      long: 18.4131,
      lat: 44.8167
    },
    /*
    {
      name: "Stock Market Crash",
      desc: "Beginning of the Great Depression; Wall Street collapse",
      img: "https://upload.wikimedia.org/wikipedia/commons/0/0b/1929_stock_market_crash.jpg",
      year: 1929,
      long: -74.0060,
      lat: 40.7128
    },
    {
      name: "Attack on Pearl Harbor",
      desc: "Japanese attack on U.S. naval base leading to U.S. entry into WWII",
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/The_USS_Arizona_%28BB-39%29_burning_after_the_Japanese_attack_on_Pearl_Harbor_-_NARA_195617_-_Edit.jpg/1920px-The_USS_Arizona_%28BB-39%29_burning_after_the_Japanese_attack_on_Pearl_Harbor_-_NARA_195617_-_Edit.jpg",
      year: 1941,
      long: -157.9394,
      lat: 21.3546
    },
    */
    {
      name: "D-Day",
      desc: "Allied invasion of Normandy, pivotal in liberating France in WWII",
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Into_the_Jaws_of_Death_23-0455M_edit.jpg/1920px-Into_the_Jaws_of_Death_23-0455M_edit.jpg",
      year: 1944,
      long: -0.60,
      lat: 49.34
    },
    /*
    {
      name: "Battle of Dien Bien Phu",
      desc: "Decisive battle leading to the end of French rule in Vietnam",
      img: "https://upload.wikimedia.org/wikipedia/commons/f/f7/French_prisoners_after_the_battle_of_Dien_Bien_Phu.jpg",
      year: 1954,
      long: 103.1500,
      lat: 21.3833
    },
    {
      name: "Gulf of Tonkin Incident",
      desc: "Incident that escalated U.S. involvement in the Vietnam War",
      img: "https://upload.wikimedia.org/wikipedia/commons/a/a2/USS_Maddox_DD-731.jpg",
      year: 1964,
      long: 108.3239,
      lat: 16.0726
    },
    {
      name: "Tet Offensive",
      desc: "Major North Vietnamese and Viet Cong assault during the Vietnam War",
      img: "https://upload.wikimedia.org/wikipedia/commons/9/9b/TetOffensiveSaigon.jpg",
      year: 1968,
      long: 106.6297,
      lat: 10.8231
    },
    {
      name: "Fall of Saigon",
      desc: "Final battle of the Vietnam War leading to U.S. withdrawal and unification of Vietnam",
      img: "https://upload.wikimedia.org/wikipedia/commons/f/f4/Fall_of_Saigon.jpg",
      year: 1975,
      long: 106.6297,
      lat: 10.8231
    },
    */
    {
      name: "Hiroshima Bombing",
      desc: "First atomic bomb dropped on Hiroshima by the U.S., ending WWII",
      img: "https://upload.wikimedia.org/wikipedia/commons/f/f9/Boeing_B-29A-45-BN_Superfortress_44-61784_6_BG_24_BS_-_Incendiary_Journey.jpg",
      year: 1945,
      long: 132.4553,
      lat: 34.3853
    },
    /*
    {
      name: "Cuban Missile Crisis",
      desc: "13-day confrontation between the U.S. and the Soviet Union over nuclear missiles in Cuba",
      img: "https://upload.wikimedia.org/wikipedia/commons/e/e9/President_Kennedy_addresses_the_nation_on_Cuban_missile_crisis.jpg",
      year: 1962,
      long: -82.3666,
      lat: 23.1136
    },
    */
    {
      name: "Moon Landing",
      desc: "First human moon landing by Apollo 11 mission",
      img: "https://i.natgeofe.com/k/9a07ccb8-f957-4dc2-becf-623df8aff3ce/moon-landing-textimage_2.png",
      year: 1969,
      long: -95.0900,
      lat: 29.5593
    },
    /*
    {
      name: "Berlin Airlift",
      desc: "Soviet blockade of West Berlin overcome by Allied airlift",
      img: "https://upload.wikimedia.org/wikipedia/commons/f/f4/C-54s_unloading_at_Tempelhof_Airport_Berlin_1948.jpg",
      year: 1948,
      long: 13.4061,
      lat: 52.5206
    },
    {
      name: "Fall of the Berlin Wall",
      desc: "Symbolic end of the Cold War and East-West divide in Europe",
      img: "https://upload.wikimedia.org/wikipedia/commons/f/fd/Fall_of_the_Berlin_Wall.jpg",
      year: 1989,
      long: 13.3762,
      lat: 52.5163
    },
    {
      name: "Indian Independence",
      desc: "End of British rule in India and creation of independent India and Pakistan",
      img: "https://upload.wikimedia.org/wikipedia/commons/7/7f/Mahatma_Gandhi%2C_Jawaharlal_Nehru_and_Sardar_Patel.jpg",
      year: 1947,
      long: 77.2167,
      lat: 28.6667
    },
    {
      name: "Fall of the Soviet Union",
      desc: "Official dissolution of the Soviet Union and end of the Cold War",
      img: "https://upload.wikimedia.org/wikipedia/commons/a/ad/RedSquareBasilCathedral.jpg",
      year: 1991,
      long: 37.6176,
      lat: 55.7558
    },
    */
    {
      name: "Nelson Mandela's Release from Prison",
      desc: "End of apartheid era and beginning of democratic transition in South Africa",
      img: "https://www.cincinnati.com/gcdn/presto/2020/02/08/PCIN/a8fed853-8cf1-4759-94cb-22ef2e9f8248-CINCpt_12-06-2013_Kentucky_1_A001__2013_12_05_IMG_520920253_2_1_6Q5RI4MR_L329174237_IMG_520920253_2_1_6Q5RI4MR.jpg?width=1200&disable=upscale&format=pjpg&auto=webp",
      year: 1990,
      long: 18.4233,
      lat: -33.9186
    }
    /*
    {
      name: "9/11 Attacks",
      desc: "Terrorist attacks on the World Trade Center and the Pentagon",
      img: "https://upload.wikimedia.org/wikipedia/commons/9/91/September_11_photo_montage.jpg",
      year: 2001,
      long: -74.0134,
      lat: 40.7115
    }
    */
  ];
  