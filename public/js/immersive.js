function main (){
  console.log("loaded");
  document.addEventListener('keydown', onKeydown, false);
  document.addEventListener('keyup', onKeyup, false);
}
document.addEventListener('DOMContentLoaded', main, false);
var lastEvent,
    requestID,
    loopStoped=true,
    velocity=0,
    startTime=0,
    lastTime=0,
    interval=0,
    A=0.0002,
    THREHOLD= 20,
    rotate=0;


// reset to defualt
function onKeyup(e){
  // console.log("keyup");
  velocity=0;
  startTime = 0;
  lastTime = 0;
  interval = 0;

  switch (e.keyCode) {
    case 38:
      //reposite cards to preset slots
      repositeCards("forward");
      // stop the move loop
      stopLoop();
      break;

    case 40:
      repositeCards("backward");
      stopLoop();
      break;

    case 37:
      console.log("keyup: LEFT"+e.keyCode);
      stopLoop();
      rotateStandalize("left");
      document.querySelector('body').className="transition";
      setTimeout(setFocus, 300);
    break;

    case 39:
      console.log("keyup: RIGHT" + e.keyCode);
      stopLoop();
      rotateStandalize("right");
      document.querySelector('body').className="transition";
      setTimeout(setFocus, 300);
    break;

    default:
      break;
    }

}

function repositeCards(directon){
  var re = /layer-+\d/;
  var cards=document.querySelectorAll('.center .card');
  if("forward"==directon){
    directon = 1;
  }else if ("backward"==directon) {
    directon = -1;
  }else {
    return;
  }
  for(var i=0; i<cards.length; i++){
    var card=cards[i];
    // clear computed style
    if(card.attributes&&card.attributes.style){
      card.attributes.removeNamedItem("style");
    }else {
      // console.log("NO STYLE: "+ card);
    }


    card.className = card.className.replace(re,"transition layer-"+(i+directon));
     //replace layer classes as order
    if((i+directon)>=cards.length){
     card.className = card.className.replace(re,"layer-0");
     document.querySelector(".center").insertBefore(card,cards[0]);
    }
    if((i+directon)<0){
      card.className = card.className.replace(re,"layer-6");
      document.querySelector(".center").appendChild(card);
    }
  }
}

function stopLoop(){
  if(requestID){
    // console.log(requestID);
    window.cancelAnimationFrame(requestID);
    requestID = undefined;
    loopStoped=true;
  }
}

function setFocus(){
  document.querySelector('.transition.collections').classList.add("center");
}

function onKeydown(e){
  // console.log(e.keyCode);
  var cards=document.querySelectorAll('.center .card');
  for(var i=0; i<cards.length; i++){
    cards[i].classList.remove("transition");
  }
  switch (e.keyCode) {
    case 13:
      console.log("enter");
      break;
    case 40:
      console.log("arrowDown");
      if(loopStoped){
          requestID = window.requestAnimationFrame(moveBackward);
      }
      break;
    case 37:
      console.log("arrowLeft");

      //remove body transition
      document.querySelector('body').className="";

      //remove transition && center class for collections
      document.querySelector('.center') && document.querySelector('.center').classList.remove("center");
      document.querySelector('.collections.transition') && document.querySelector('.collections.transition').classList.remove("transition");
      if(loopStoped){
          requestID = window.requestAnimationFrame(rotateLeft);
      }
      break;
    case 39:
      console.log("arrowRight");

      //remove body transition
      document.querySelector('body').className="";

      //remove transition && center class for collections
      document.querySelector('.center')&&document.querySelector('.center').classList.remove("center");
      document.querySelector('.collections.transition')&&document.querySelector('.collections.transition').classList.remove("transition");
      if(loopStoped){
          requestID = window.requestAnimationFrame(rotateRight);
      }
      break;
    case 38:
      console.log("arrowUp");
      // start the moveForward loop;
      if(loopStoped){
          requestID = window.requestAnimationFrame(moveForward);
      }
      break;
    default:
      break;
  }
}

/*
the velocity curve
*/
function getPercentage(interval){
  var percentage;
  if(interval<THREHOLD){
    // p=1/2 * A * t * t
    percentage = Math.pow(interval, 2) * A / 2 ;
  }else{
    //linear after
    percentage = Math.pow(THREHOLD, 2) * (A / 2) + (A*THREHOLD*(interval - THREHOLD));
    // console.log("LINEAR");
  }
  //just need the percentage
  percentage = percentage % 1;
  return percentage;
}

function moveCards(directon, percentage){
  var cards=document.querySelectorAll('.center .card');
  var p;

  for (var i=0; i<cards.length; i++){
    if("forward"==directon){
      console.log("moveForward");
      p=i+percentage;
    }else if ("backward"==directon) {
      p=i-percentage;
      if(p<0){
        p=p+7;
      }
    }else {
      p=null;
      console.log("jump out");
      break;
    }
    console.log("percentage: "+p);
    var card=cards[i];

    /*
    get card's transsform
    */
    var st=window.getComputedStyle(card,null); //get computed style
    var transform=st.getPropertyValue("transform"); //get transform property
    var transformValue=transform.split('(')[1].split(')')[0].split(',');// get value, split
    var scaleX, scaleY, scaleZ, y, z;
    if(16 == transformValue.length){ // if 3d matrix
      scaleX=parseFloat(transformValue[0]);
      scaleY=parseFloat(transformValue[5]);
      scaleZ=parseFloat(transformValue[10]);
      y=parseInt(transformValue[13]);
      z=parseInt(transformValue[14]);// get z value in int
    }else { // 2d matrix
      scaleX=scaleY=scaleZ=1;
      y=z=0;
    }

    /*
    card transform curve
    it's not linear in different devarity
    */
    if(p < 4){ // for cards in behind
      z = Math.round((p * 100) - 600);
      card.style.opacity="1";
      card.style.transform="translate3d(0px, 0px, " + z +"px)";
    }else if(4 <= p && 5 > p){ // speed * 3 for the second card to makesure all cards arrive at same time
      z=Math.round((p-4)*300 - 200);
      card.style.opacity="1";
      card.style.transform="translate3d(0px, 0px, " + z +"px)";

    }else if (5 <= p && 6 > p) { // speed * 1.5 for the first card
      // console.log("1.25X: \n"+"i= "+i +";    " + "dz= " + dz );

      scaleX = scaleY = (p-5)*0.2 + 1;
      // scaleZ += dz*0.5/50;
      z=Math.round((p-5)*150 + 100);
      y=Math.round((p-5)*260);
      // opacity
      var opacity=st.getPropertyValue("opacity");
      opacity=parseFloat(opacity);
      opacity=1-((p-5)*1.5);
      // if(opacity <= 0){
      //   console.log("z position: "+ z);
      // }
      // set style
      card.style.opacity=opacity;
      card.style.transform="translate3d(0px, "+ y +"px, " + z +"px) "+
                           "scale3d(" + scaleX +", "+scaleY+", "+scaleZ +")";
    }else {
      z = Math.round((p-6)*100 + 250);
      card.style.opacity=0;
      card.style.transform="translate3d(0px, "+ y +"px, " + z +"px) "+
                           "scale3d(" + scaleX +", "+scaleY+", "+scaleZ +")";
      // console.log("BEFORE TRANSFORM: "+ transformValue);
    }
    if(350 <= z){// resert the card to start point when reach end
      // z =Math.round((p*100)-600);
      // card.style.transform="translate3d(0px, 0px, " + z +"px)";
      // card.style.opacity="1";
      document.querySelector(".center").insertBefore(card,cards[0]);
    }
    if(i===0){
      // console.log(card.style.transform);
    }
  }
}

function moveForward(timestamp) {
  loopStoped=false;
  if ( 0 === startTime) {
    // first loop, dont move; set velocity to 0
    velocity=0;
    startTime=timestamp;
  }else{
    //get how long the animations runs
    interval = timestamp - startTime;
    var percentage=getPercentage(interval);
    moveCards("forward", percentage);
  }
  // lastTime = timestamp;
  requestID = window.requestAnimationFrame(moveForward);
}

function moveBackward(timestamp){
  loopStoped=false;
  if ( 0 === startTime) {
    // first loop, dont move; set velocity to 0
    velocity=0;
    startTime=timestamp;
  }else{
    //get how long the animations runs
    interval = timestamp - startTime;
    var percentage=getPercentage(interval);
    moveCards("backward",percentage);
  }
  // lastTime = timestamp;
  requestID = window.requestAnimationFrame(moveBackward);
}

function rotateLeft(timestamp){
  loopStoped=false;
  if ( 0 === startTime) {
    // first loop, dont move; set velocity to 0
    velocity=0;
    startTime=timestamp;
  }else{
    //get how long the animations runs
    interval = timestamp - startTime;
    var percentage=getPercentage(interval);
    rotateCollection("left", percentage);
  }
  // lastTime = timestamp;
  requestID = window.requestAnimationFrame(rotateLeft);
}

function rotateRight(timestamp){
  loopStoped=false;
  if ( 0 === startTime) {
    // first loop, dont move; set velocity to 0
    velocity=0;
    startTime=timestamp;
  }else{
    //get how long the animations runs
    interval = timestamp - startTime;
    var percentage=getPercentage(interval);
    rotateCollection("right", percentage);
  }
  // lastTime = timestamp;
  requestID = window.requestAnimationFrame(rotateRight);
}

function rotateCollection(directon,percentage){
  var deg;
  "left"==directon? deg=1: "right"==directon ? deg=-1:deg = 0;
  deg *= (percentage*8);
  rotate+=deg;
  document.querySelector('.container-3d').style.transform="scale3d(2.2,2.2,2.2)   rotateY("+rotate+"deg)";
  var bgRoll=rotate/0.45;
  document.querySelector('body').style.backgroundPositionX = bgRoll+"%";
  // console.log("ROTATE: "+rotate);
}

function rotateStandalize(directon){
  var d=rotate%45;
  console.log("BEFORE: "+ rotate);
  console.log("d is :" + d);
  if("left"==directon){
    rotate = rotate>0? rotate - d + 45 : rotate - d;
  }else if("right"==directon){
    rotate = d<0? rotate - d -45 : rotate-d;
  }else{
    console.log("wrong");
  }
  console.log("AFTER: "+ rotate);
  document.querySelector('.container-3d').style.transform="scale3d(2.2,2.2,2.2)   rotateY("+rotate+"deg)";
  // background rolling
  var bgRoll=rotate/0.45;
  document.querySelector('body').style.backgroundPositionX = bgRoll+"%";
  //restore center class
  var index=(9-((rotate/45)%8))%8; //get center position
  document.querySelectorAll('.collections')[index].classList.add("transition");
}

function naviForward() {
  // manipulating the cards UI, by change class to "layer-"+1
    var cards=document.querySelectorAll('.center .card');
    // console.log(cards);
    for (var i=0; i<cards.length; i++){
      // console.log("change started");
      var card=cards[i];
      var curClass="layer-"+i ,
          newClass;
      if(i<6){
        newClass="layer-"+(1+i);
      }else {
        newClass="layer-0";
        document.querySelector('.center').insertBefore(card, document.querySelector(' .layer-1'));
        // need to rebind layer-0 content
      }
      card.classList.remove(curClass);
      card.classList.add(newClass);
    }
}

function naviBackward() {
  // manipulating the cards UI, by change class to "layer-"-1
    var cards=document.querySelectorAll('.center .card');
    // console.log(cards);
    for (var i=0; i<cards.length; i++){
      console.log("change started");
      var card=cards[i];
      var curClass="layer-"+i ,
          newClass;
      if(i>0){
        newClass="layer-"+(i-1);
      }else {
        newClass="layer-6";
        document.querySelector('.center').appendChild(card);
        // need to rebind layer-6 content
      }
      card.classList.remove(curClass);
      card.classList.add(newClass);
    }
}
