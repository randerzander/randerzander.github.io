var post = $('#post');
var postList = $('#postList');

function init(href){
  //Check URL param for explicit post
  var queryParams = window.location.href.split('/').slice(-1)[0].replace('?', '').replace('#', '').split('&');
  var postUrl = $.grep(queryParams, function(v, i){ return v.length == 0 || v.split('=')[0] == 'post'; })[0].split('=').slice(-1)[0];
  if (typeof href != 'undefined') postUrl = href;

  //Display post content
  var path = 'posts/';
  if (postUrl.length > 0 && postUrl.indexOf('.md') > -1) path += postUrl;
  else path += 'latest.md';
  $.get(path, function(data){
    while (post[0].firstChild) post[0].removeChild(post[0].firstChild);
    post.append(marked(data));
    $.each($('[gist]'), function(i, v){
      $('<p data-gist-id="'+v.getAttribute('gist')+'"/>').appendTo(v).gist();
    });
  });

  //Display post list
  $.get('posts/posts.txt', function(data){
    while (postList[0].firstChild) postList[0].removeChild(postList[0].firstChild);
    $.each(data.split('\n'), function(i, line){
      var desc = $.trim(line.split(',')[0]);
      var href = $.trim(line.split(',')[1]);
      postList.append('<p><a href="#?post='+href+'" onclick="init(\''+href+'\');">'+desc+'</a></p>');
    });
  });
}
