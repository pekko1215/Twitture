const ejs = require('ejs');
const fs = require('fs');
const webshot = require('webshot')
var tweets = [{
	name:"ヒデホヒ",
	id:"eakonnsamui",
	text:"家の畑で取れた、新鮮なカツオのタタキを送ります。",
	icon:"https://pbs.twimg.com/profile_images/895481564858949632/CEPOJMIt_bigger.png",
	images:["https://temaeitamae.jp/top/t6/j/tmimg/tm-12.jpg","https://cook3.heteml.jp/cook3com/img/product/tosasaga/katsuo/11.jpg"],
	isOwner:true
},{
	name:"モンゴル上田",
	id:"mongoruue",
	text:"まあすてき",
	icon:"https://kotobank.jp/image/dictionary/daijisen/media/102407.jpg",
	images:[]
}]

webshot('./render/liner/out.html','google.png',{
	siteType:'file',
	customCSS:require('fs').readFileSync('./render/liner/style.css','utf-8')
},(err)=>{
	console.log(err)
})
console.log(tweets)

fs.writeFileSync('./render/liner/out.html',ejs.render(fs.readFileSync('./render/liner/index.ejs','utf8'),{tweets:tweets}),'utf8');