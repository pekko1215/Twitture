var tweetStack = [];
$(() => {
    var $old = $('.current-content').eq(0)
    var $new = $('.current-content').eq(1)
    var $url = $('#url');
    var buf;
    $('#request_url').click((e)=>{
		$('#tweets').children().remove();
		var num = $url.val().match(/\d+$/)[0];
		if(isNaN(num)){return}
		$.get('/utils/replies?id='+num,data=>{
			updateTweets(data)
			var xhr = new XMLHttpRequest;
			xhr.onreadystatechange = function(){
				if(this.readyState==4&&this.status==200){
					$('#content_button').show()
					$('#image-disp')[0].src = URL.createObjectURL(this.response)
					$('#request_load').remove();
					buf = this.response;
				}
			}
			xhr.open('POST','/utils/create');
			xhr.responseType = 'blob';
			xhr.setRequestHeader("Content-Type", "application/json");
			xhr.send(JSON.stringify({list:data}))
		});
		$(document.body).after($('<div class="loader" id="request_load"></div>'));
    })

    $('#url').on('keydown',(e)=>{
		e.key ==  'Enter' && $('#request_url').click();
    })

    $('#to_tweet_button').on('click',()=>{
		var text = $('textarea').val()
		var form = new FormData();
		form.append('text',text);
		form.append('img',buf);
		console.log(form)
		$.ajax({
			type:"POST",
			url:'utils/tweet',
			data:form,
			processData: false,
		    contentType: 'multipart/form-data',
			success:function(res){
				console.log(res)
			}
		})
    })
})

function escapeHTML(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/\n/g, '<br>');
};

function updateTweets(data) {
    var $old = $('.current-content').eq(0)
    var $new = $('.current-content').eq(1)
    $('#tweets').children().remove();
    data.forEach(tweet => {
        var $card = $(tweetDOMParser(tweet));
		$('#tweets').append($card)
    })
}

function tweetDOMParser(tweet) {
	var users = tweet.text.match(/@.+?\s/g)||[];
	users = users && users.map(t=>t.slice(1,-1))
    return `
	<div class="col-lg-6" style="height:130px;margin-bottom:5px;">
		<div class="panel panel-info" style="height:100%">
			<div class="panel-heading">
				${escapeHTML(tweet.user.screen_name)}${users[0]?"→"+users[0]:""}${users.length>1?'...':''}
			</div>
			<div class="panel-body">
				<p class="panel-hide">
				${escapeHTML(tweet.text)}
				</p>
			</div>
		</div>
	</div>
		`
}

function ImageToBase64(img, mime_type) {
    // New Canvas
    var canvas = document.createElement('canvas');
    canvas.width  = img.width;
    canvas.height = img.height;
    // Draw Image
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    // To Base64
    return canvas.toDataURL(mime_type);
}