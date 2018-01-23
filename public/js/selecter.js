var tweetStack = [];
$(() => {
    var $old = $('.current-content').eq(0)
    var $new = $('.current-content').eq(1)
    $('#tweets').children().remove();
    $.get('/utils/list', (data) => {
        updateTweets(data)
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
        $card.click((e) => {
			$('#tweets').children().remove();
            $old.text($new.text());
            $new.text(tweet.text);
            tweetStack.push(tweet);
            $.get(`/utils/replies?id=${tweet.id_str}&username=${tweet.user.screen_name}`, data => {
				updateTweets(data)
            })
        })
		$card.data('idstr', tweet.id_str)
		$('#tweets').append($card)
    })
}

function tweetDOMParser(tweet) {
    return `
	<div class="card">
		<div class="card-header">
			${escapeHTML(tweet.user.name)}
		</div>
			<div class="card-body">
				${escapeHTML(tweet.text)}
			</div>
		</div>
		`
}