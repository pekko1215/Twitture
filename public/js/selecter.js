var tweetStack = [];
$(() => {
    var $old = $('.current-content').eq(0)
    var $new = $('.current-content').eq(1)
    var $url = $('#url');
    window.buf;
    $('#request_url').click((e) => {
        $('#tweets').children().remove();
        var num = $url.val().match(/\d+$/)[0];
        if (isNaN(num)) { return }
        $.get('/utils/replies?id=' + num, data => {
            updateTweets(data)
            var xhr = new XMLHttpRequest;
            xhr.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    $('#content_button').show()
                    var bytes = new Uint8Array(this.response);
                    var binary = '';
                    for(var i=0,len = bytes.byteLength;i<len;i++){
						binary += String.fromCharCode(bytes[i]);
                    }
                    $('#image-disp')[0].src = "data:image/jpeg;base64," + window.btoa(binary);
                    $('#request_load').remove();
                    buf = new Blob([ this.response ], { type: "image/jpeg" });;
                }
            }
            xhr.open('POST', '/utils/create');
            xhr.responseType = 'arraybuffer';
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.send(JSON.stringify({ list: data }))
        });
        $(document.body).after($('<div class="loader" id="request_load"></div>'));
    })

    $('#url').on('keydown', (e) => {
        e.key == 'Enter' && $('#request_url').click();
    })

    $('#to_tweet_button').on('click', () => {
        var $textarea = $('textarea');
        var $to_tweet_button = $('#to_tweet_button');
        var text = $textarea.val();
        var form = new FormData();
        form.append('text', text);
        form.append('img', buf);
        $to_tweet_button.prop('disabled', true);
        $textarea.attr('readonly', true);
        $.ajax({
            type: "POST",
            url: 'utils/tweet',
            data: form,
            processData: false,
            contentType: false,
            success: function(res) {
                $textarea.val('');
                $textarea.attr('readonly', false);
                $to_tweet_button.prop('disabled', false);

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
    var users = tweet.text.match(/@.+?\s/g) || [];
    users = users && users.map(t => t.slice(1, -1))
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
    canvas.width = img.width;
    canvas.height = img.height;
    // Draw Image
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    // To Base64
    return canvas.toDataURL(mime_type);
}