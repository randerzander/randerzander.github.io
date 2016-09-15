var post = $('#post');
var postList = $('#postList');

function init(href){
  //Check URL param for explicit post
  var queryParams = window.location.href.split('/').slice(-1)[0].replace('?', '').replace('#', '').split('&');
  var postUrl = $.grep(queryParams, function(v, i){ return v.length == 0 || v.split('=')[0] == 'post'; })[0].split('=').slice(-1)[0];
  if (typeof href != 'undefined') postUrl = href;

  //Display post list
  $.get('posts/posts.txt', function(data){
    //Empty the list
    while (postList[0].firstChild) postList[0].removeChild(postList[0].firstChild);
    //Add each post to the list of posts
    $.each(data.split('\n'), function(i, line){
      var desc = $.trim(line.split(',')[0]);
      var href = $.trim(line.split(',')[1]);
      postList.append('<p><a href="#?post='+href+'" onclick="init(\''+href+'\');">'+desc+'</a></p>');
    });

    //Display post content
    var path = 'posts/';
    if (postUrl.length > 0 && postUrl.indexOf('.md') > -1) path += postUrl;
    else path += data.split('\n')[0].split(',')[1];
    $.get(path, function(data){
      while (post[0].firstChild) post[0].removeChild(post[0].firstChild);
      post.append(marked(data));
      $.each($('[data-gist-id]'), function(i, v){ $(v).appendTo(v).gist(); });
    });
  });
}
