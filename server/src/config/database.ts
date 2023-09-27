import mongoose from 'mongoose';

const clientOptions = {
    authSource: "admin",
    user: "root",
    pass: "tneladmin1248",
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

export async function connectToDatabase() {
    try {
        await mongoose.connect('mongodb://localhost:27017/sushi', clientOptions);
    } catch (error) {
        console.log(error);
    }
}
