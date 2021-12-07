import { Component } from '@angular/core';
import { NEVER, Subject, timer } from 'rxjs';
import { scan, startWith, switchMap, tap } from 'rxjs/operators';
import { interval} from 'rxjs';
import { FormControl } from '@angular/forms';
import { CognitiveWordPair } from './models/cognitive-result.model'

enum TestBLockEnum {
  INSTRUCTIONBOX,
  SHOWPAIRWORD,
  BLANKSCREEN,
  FILLPAIRWORD,
  ANSWERRESPONSE,
  SUCCESBLOCK,
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})



export class AppComponent {
  title = 'rxjs-tutorial';
  secondWordPair = new FormControl('');
  testBLockEnum = TestBLockEnum;
  testBlockState;
  pairIndex: number;
  firstPairWord: boolean;
  pairAnswer: string;
  isShowNextRound: boolean;
  orderOfword: Array<CognitiveWordPair> = [];
  wordPairTextValue: CognitiveWordPair;
  ansValueText: CognitiveWordPair;
  noOfRound = 3;
  roundData = [];
  correcCount: number = 0;
  intialCounterPauseState: number;
  questionsOfwords = [];
  wordsArray = [
    {
      wordA: 'guuni',
      wordB: 'golu'
    },
    {
      wordA: 'dholu',
      wordB: 'molu'
    },
    {
      wordA: 'madar',
      wordB: 'chod'
    },

  ];
  wordPairArray = [];
  ansArray = [];

  private counterSubject: Subject<{ pause?: boolean, counterValue?:number }> = new Subject();
  private userAnswerSubject: Subject<{ pause?: boolean, userAnswercounterValue?:number }> = new Subject();

  constructor(){

  }


  ngOnInit(): void {
    this.testBlockState = TestBLockEnum.INSTRUCTIONBOX;
    this.initializeCounter();
    this.wordPairArray = [...this.wordsArray];
    this.ansArray = [...this.wordsArray];
    console.log(this.wordPairArray);

  }

  public initializeCounter() {
    return this.counterSubject.pipe(startWith(
      {pause: true, counterValue: 0}
    ),
    scan((acc,val) => ({
      ...acc, ...val
    })), tap((state) => {
      this.intialCounterPauseState = state.counterValue;
    }),switchMap((state) => state.pause ? NEVER: interval(100).pipe(tap(val => {
        this.testBlockState = TestBLockEnum.SHOWPAIRWORD;
        state.counterValue += 100;
        console.log(state.counterValue);
        this.firstPairWord = true;
      if(state.counterValue >= 4000/2){
        this.firstPairWord = false;
      }
      if(state.counterValue >= 4000){
        this.counterSubject.next({ pause: true });
        this.testBlockState = TestBLockEnum.BLANKSCREEN;
        setTimeout(() => {
          if(this.wordPairArray.length === 0){
            console.log('Sab Khatam');
            this.counterSubject.next({pause: true});
            this.secondRound();
          }else{
            this.getIndexUpdateArray();
            this.counterSubject.next({ counterValue: 0});
            this.counterSubject.next({pause: false});
          }
        }, 2000);
       }
    }))
    )).subscribe()
  }

  public secondRound(): void{
    if(this.ansArray.length <= 0){
      this.testBlockState = TestBLockEnum.SUCCESBLOCK;
      //   if(this.roundData){
      //     this.roundData.push(
      //       {
      //       orderOfwords: this.orderOfword,
      //       questionsOfwords: this.questionsOfwords
      //       }
      //     );
      //     this.orderOfword = []
      //     this.questionsOfwords = []
      // }else{
      //   this.roundData = [
      //     {
      //       orderOfwords: this.orderOfword,
      //       questionsOfwords: this.questionsOfwords
      //     }
      //   ];
      //   this.orderOfword = []
      //   this.questionsOfwords = []
      // }
      // const result = Math.round((this.correcCount / this.cognitive.wordPairs.length) * 100)
      // if(result >= this.cognitive.passPercentage || this.roundData.length === this.cognitive.totalNumberroundswordPair){
      //   this.isShowNextRound = false;
      //   this.saveTestRespose();
      //   setTimeout(() => {
      //     this.dismissModal();
      //     }, 2000);
      // }else{
      //   this.isShowNextRound = true
      // }
      // this.counterSubject.next({ pause: true});
      // this.counterSubject.next({ counterValue: 0});
      // this.userAnswerSubject.next({ pause: true});
      // this.userAnswerSubject.next({ userAnswercounterValue: 0});
    }else{
      this.userAnswerSubject.next({pause: false});
      this.testBlockState = TestBLockEnum.FILLPAIRWORD;
      this.getRandomIndex(this.ansArray);
      this.ansValueText = this.ansArray[this.pairIndex];
      this.ansArray.splice(this.pairIndex, 1);
    }
  }

  public startTest(): void{
    this.getIndexUpdateArray();
    console.log('Hello');
    this.startCounter();
  }


  public startCounter(){
    return this.counterSubject.next({pause: false});
  }

  public nextRound(): void{
    // this.wordPairArray = [...this.cognitive.wordPairs];
    // this.ansArray = [...this.cognitive.wordPairs];
    // this.startTest();
  }


  public getIndexUpdateArray(): void{
    this.getRandomIndex(this.wordPairArray);
    this.wordPairTextValue = this.wordPairArray[this.pairIndex];
    console.log(this.wordPairTextValue);
    this.orderOfword.push(this.wordPairTextValue);
    console.log(this.orderOfword);
    this.wordPairArray.splice(this.pairIndex, 1);

  }

  public getRandomIndex(items) {
    let randomIndex =
      Math.floor(Math.random() * items.length);
    this.pairIndex = randomIndex;
    return this.pairIndex;
  }

  public submitPairValue(): void {

    let formValue = this.secondWordPair.value.toLowerCase();
    console.log(formValue);
    if(formValue === this.ansValueText.wordB) {
      console.log('shi');
      this.pairAnswer = "Correct";
      this.correcCount ++;
    }else{
      this.pairAnswer = "Incorrect";
      console.log('Galat');
    }
    this.questionsOfwords.push({
      question: this.ansValueText.wordB,
      answer: this.secondWordPair.value,
      ansResult: this.pairAnswer,
    });
    this.secondWordPair.reset();
    this.testBlockState = TestBLockEnum.ANSWERRESPONSE;
    // this.userAnswerSubject.next({ pause: true});
    // this.userAnswerSubject.next({ userAnswercounterValue: 0});
    // this.userAnswerSubject.next({ pause: false});
    setTimeout(() => {
      this.secondRound();
    }, 2000);

  }

}
