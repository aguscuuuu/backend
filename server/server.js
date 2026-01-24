import app from "./src/app.js";
import { initMongoDB } from "./src/config/connection.js";
import open from 'open';

const PORT = 8080; 

initMongoDB(); 

app.listen(PORT, () => {
    console.log(`Servidor conectado exitosamente.\nRuta: http://localhost:${PORT}/`);
    open(`http://localhost:${PORT}`);
});
