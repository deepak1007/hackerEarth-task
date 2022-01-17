import dotenv from 'dotenv';
dotenv.config()
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { ECO, ECOData } from "./lib/ECO"
const ECOObj = new ECO();


const app = express();

app.use(cors());
app.use(bodyParser.json({limit: '10mb', strict: false}));

app.use((req, res, next) => {
    if (req.method === 'GET')
      res.set('Cache-control', `public, max-age=180`)
    else
      res.set('Cache-control', `no-store`)
    next()
})

app.get('/test-api', (req, res)=>{
    res.sendFile(__dirname + '/index.html');
})

app.get('/', async(req, res, next)=>{
    try {
        const details : ECOData[] = await ECOObj.getAll();
        res.status(200).json({success: true, message: "all moves", data: details || []})
    } catch (error) {
        console.log(error);
        res.status(500).json({success: false, message: "sorry some error occured"})
    }
})

app.get('/:code', async(req, res, next)=>{
    try {
        const code : string = req.params.code;
        const data : ECOData = await ECOObj.getMovesWithCode(code);

        if(data) {
            return res.status(200).json({success: true, message: "details found", data: {
                openingName : data.openingName,
                moves : data.moves
            }})
        }

        res.status(200).json({success: false, message: "sorry code details not found"})
    } catch (error) {
        console.log(error);
        return res.status(500).json({success: false, message: "Sorry some error occured"})
    }
})


app.get('/:code/*', async(req, res, next)=> {
    try {
        const code : string = req.params.code;
        const playedMovesSequence : string = req.params[0];
        const nextMove : string = await ECOObj.getNextMove(code, playedMovesSequence);

        let response;
        if(!nextMove) {
            response = {
                success : false,
                message : "no move details found",
                data : {nextMove : ""}
            }
        }
        else if(nextMove === "no-next-move") {
            response = {
                success : false,
                message : "no move left",
                data : {nextMove : ""}
            }
        }

        else if(nextMove === "invalid-move-sequence") {
            response = {
                success : false,
                message : "invalid move sequence",
                data : {nextMove : ""}
            }
        }
        else
            response = {
                success : true,
                message : "found next move",
                data : { nextMove  }
            }

        res.status(200).json(response);
    } catch (error) {
        console.log(error);
        res.status(500).json({success: false, message: "sorry some error occured"})
    }
})

app.listen(process.env.PORT || 8080, () => {
    console.log("api is listening on ", process.env.PORT || 8080)
})