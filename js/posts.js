var post = $('#content')

var oldWrite = document.write;
document.write = function(node){ post.append(node) }


function init(){
    $.get('../posts/latest.md', function(data){
      var lines = data.split('\n');
      $.each(lines, function(i, line){
        var custom = false;
        $.each(custom_delims, function(delim, func){
          if (line.indexOf(delim) > -1){
            post.append(func(line.split(delim)[1]));
            custom = true;
          }
        });
        if (custom == false) post.append(markdown.toHTML(line, 'Maruku'));
      });
    });
}

var custom_delims = {
  'HTML:': function(line){ return line; },
  'SCRIPT:': function(line){ $.getScript(line); return ''; }
};
