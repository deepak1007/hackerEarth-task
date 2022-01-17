import fetch from 'node-fetch';
import * as htmlParser  from 'node-html-parser'

export interface ECOData {
   code : string,
   openingName : string,
   moves : string[]
}

export class ECO {
   ecoData : ECOData[]
   ttl : number= 180000 // server side caching (not required as http response is static but just for demo we are caching response data for sometime then it will get invalid and we will request new data)
   lastUpdate : Date // for verifing ttl

   constructor() {
      this.fetchECOData();
   }

   async getAll() : Promise<ECOData[]> {
      if(!this.validCache())
         this.ecoData = await this.fetchECOData();

      return this.ecoData;
   }

   async getMovesWithCode(code : string) : Promise<ECOData> {
      if(!this.validCache())
         this.ecoData = await this.fetchECOData();

      return this.ecoData.find((data) => data.code === code.toLowerCase());
   }

   async getNextMove(code: string, playedMovesSequence: string) : Promise<string> {
      if(!this.validCache())
         this.ecoData = await this.fetchECOData();

      const moveDetails = await this.getMovesWithCode(code);
      if(!moveDetails) return null;

      const movesSequence : string = moveDetails.moves.join('/');

      // playedMovesSequence should start from index 0 of movesSequence and should be valid move sequence to be a substring of available move sequence.
      if(movesSequence.indexOf(playedMovesSequence.toLowerCase()) !== 0) {
         return "invalid-move-sequence"
      }

      const playedMovesSequenceArray : string[] = playedMovesSequence.split('/').filter((moves)=>{
         if(!moves) return false // handling "" while splitting.
         return moves
      })

      if(moveDetails.moves.length === playedMovesSequenceArray.length) {
         return "no-move-left"
      }

      return moveDetails.moves[playedMovesSequenceArray.length];
   }


   async fetchECOData() :Promise<ECOData[]> {
      const response = await fetch("https://www.chessgames.com/chessecohelp.html")
      const htmlString = await response.text()
      return this.parseHtml(htmlString)
   }


   parseHtml(htmlString : string) : ECOData[]{
      const ecoData : ECOData[] = [];
      const parsedHtml = htmlParser.parse(htmlString);
      const trArray = parsedHtml.getElementsByTagName('tr');
      // remove uncommon opening
      trArray.slice(0, 1);
      for(const tr of trArray) {
         const fontTags = tr.getElementsByTagName('font');
         /* 3 font tags in each row font[0].innerText = code name
          * font[1](b tag).innerText = opening name
          * font[2].innerText = moves
          */
         const openingName : string = fontTags[1].getElementsByTagName('b')[0]?.innerText;
         const moves : string[] = [];
         for(const element of fontTags[2].innerText.split(' ')) {
            const elementNum = Number(element);
            if(isNaN(elementNum)) {
               moves.push(element.toLowerCase())
            }
         }

         ecoData.push({
            code : fontTags[0].innerText.toLowerCase(),
            openingName,
            moves
         })
      }
      this.lastUpdate = new Date();
      return ecoData;
   }


   validCache() : boolean {
      if(!this.ecoData || (new Date()).getTime() > this.lastUpdate.getTime() + this.ttl)
         return false;


      return true;
   }
}