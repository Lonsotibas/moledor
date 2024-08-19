import mongoose from "mongoose";

const config = useRuntimeConfig()

export default async () => {
    try {
        await mongoose.connect(config.mongodbUri)
        console.log("Conexion a BD establecida")

    } catch (err) {
        console.error("Conexion a BD fallo!", err)
    }
}
