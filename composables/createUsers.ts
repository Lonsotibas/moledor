export default function ()  {
    // Define parametros generales
    const nombres = [
        "Barrio yungay",
        "👽👽👽",
        "PASCL",
        "🔥🔥",
        "buscoactivo",
        "VRGN",
        "CL🐽",
        "🍀🍀",
        "SL👹 skt2",
        "CONTENIDO",
        "C/I",
        "Compartir 🧠",
        "Josue",
        "ahora",
        "2cl",
        "MSJ?",
        "invitafa",
        "🇻🇪🇻🇪🇻🇪",
        "2twinks s/L",
        "bayron",
        "MadeinArgentina",
        "busk vers cl",
        "fltmrb motivao",
        "Abraham",
        "Pas Sumiso",
        "Buscadit",
        "PPr",
        "🔱"
    ]
    const medidas= {estatura: {min: 160, max: 180}, peso: {min: 50, max:100}}
    const edades = {min: 18, max:60}
    const roles = ["Inter pasivo", "Activo", "Inter activo", "Pasivo"]
    const distancia = {min:10, max:3000}
    const generos = [
        "Hombre",
        "Mujer",
        "Transmasculino",
        "Transfemenino",
        "Trans",
        "NB"
    ]
    const pronombres = ["El", "Ella", "Elle", "Suyo", "Mi", "Cuyo"]
    const etnias = ["Latino", "Medio Oriente", "Mixto"]
    const estadosCivil = ["Soltero", "Casado", "Viudo"]
    const busca = [
        "Reuniones",
        "Amistades",
        "Vinculo",
        "Ahora",
        "Chatea",
        "Outdoor"
    ]
    const encuentro = [
        "Local",
        'Disco',
        "Pub",
        "Tu lugar",
        "Mi lugar",
        "Parque",
        "Cerro",
        "Comida",
        "Museo",
        "Apocalipsis",
        "Tecnoceno"
    ]
    const salud = {
        vacunas: [
            "Meningitis",
            "Virutela del mono",
            "Hepatitis",
            "COVID-19"
        ],
        vih: ["Negativo", "Positivo", "Indetectable", "Tomo Prep"]
    }
    const tags = [
        "amigos",
        "anónimo",
        "confiable",
        "anfitrión",
        "curioso",
        "bi",
        "buena onda",
        "besitos",
        "regaloneo",
        "salir",
        "naturaleza",
        "cruising",
        "ocioso",
        "twinks",
        "hunks",
        "jocks",
        "geeks",
        "osos",
        "lobos",
        "nutrias",
        "club",
        "junkie",
        "daddy"
    ]

    // Random generador
    const getRandomInt = (max: number) => {
        return Math.floor(Math.random() * max)
    }
    const getRandomIntRange = (min: number, max: number) => {
        const minCeiled = Math.ceil(min)
        const maxFloored = Math.floor(max)
        return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled)
    }
    const getRandomItem = (items: Array<string>) => {
        let randomInt = getRandomInt(items.length)
        return items[randomInt]
    }

    // Crea usuarios
    const cantUsers = nombres.length
    let users = []
    for (let i=0; i<=cantUsers; i++) {
        let user = {
            nombre: getRandomItem(nombres),
            pronombre: getRandomItem(pronombres),
            medidas: {
                estatura: getRandomIntRange(medidas.estatura.min, medidas.estatura.max),
                peso: getRandomIntRange(medidas.peso.min, medidas.peso.max)
            },
            edad: getRandomIntRange(edades.min, edades.max),
            rol: getRandomItem(roles),
            distancia: getRandomIntRange(distancia.min, distancia.max),
            genero: getRandomItem(generos),
            etnia: getRandomItem(etnias),
            estadoCivil: getRandomItem(estadosCivil),
            busca: getRandomItem(busca),
            encuentro: getRandomItem(encuentro),
            salud: {
                vacunas: getRandomItem(salud.vacunas),
                vih: getRandomItem(salud.vih)
            },
            tags: getRandomItem(tags)
        }
        users.push(user)
    }

    return users
}

