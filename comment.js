//The HTML needed to inject for each comment. By splitting it up into start, middle end
//it is possible to dynamically construct the unique html code each comment requires


//problem: when I replace the innerHTML, I'm changing the element and, in so doing, removing my eventlisteners

var comment_block_html_1 = "<div class='comment_block' id=";
var comment_block_html_2 = "'><span class='comment_text'>";
var comment_block_html_3 = "</span><button class ='delete_button' title='delete comment' id=";
var comment_block_html_4 = ">x</button></div>";

function getUrl(callback) {
  var request = {currentWindow: true, active: true};

  chrome.tabs.query(request, (result) => {
    var tab = result[0];
    var current_url = tab.url;
    callback(current_url);
  });
}

function getCurrentComments(url, callback){
  chrome.storage.sync.get(url, (comments) => {
    callback(chrome.runtime.lastError ? null : comments[url])
  });
}

function loadCurrentComments(url){
  getCurrentComments(url, (current_comments) => {
    var comment;
    for (i = 0; i < current_comments.length; i++){
      new_div = document.createElement('div');
      new_div.setAttribute("id", "comment_block_" + i);
      new_div.setAttribute("class", "comment_block");

      new_span = document.createElement('span');
      new_span.setAttribute("class", "comment_text");

      new_button = document.createElement('button');
      new_button.setAttribute("id", "delete_comment_" + i);
      new_button.setAttribute("class", "delete_button");
      new_button.setAttribute("title", "delete comment");

      new_text = document.createTextNode(current_comments[i]);
      x_text = document.createTextNode("x")

      new_span.appendChild(new_text);
      new_button.appendChild(x_text)
      new_div.appendChild(new_span);
      new_div.appendChild(new_button);

      document.getElementById("current_comments").appendChild(new_div);
    }
  });
}

function deleteCommentFunction(i, current_comments, url, callback){
  var delete_i = function(){
    document.getElementById("comment_block_" + i.toString()).remove();
    current_comments.splice(i, 1);
    var comments_for_storage = {};
    comments_for_storage[url] = current_comments;
    chrome.storage.sync.set(comments_for_storage);
  }
  callback(delete_i)
}

document.addEventListener('DOMContentLoaded', () => {
  getUrl((url)=>{

    loadCurrentComments(url);

    getCurrentComments(url, (current_comments) => {
      document.getElementById("comment_button").addEventListener("click", function(){
        var new_comment = document.getElementById('comment_text').value;

        if (current_comments === undefined || current_comments.length == 0){
          current_comments = [new_comment];
        }
        else{
          current_comments.push(new_comment);
        }

        //store comments for this URL as list in local memory
        var comments_for_storage = {};
        comments_for_storage[url] = current_comments;
        chrome.storage.sync.set(comments_for_storage);

        //this new comment will be the jth comment
        j = current_comments.length - 1;

        //add the newest comment to the display and remove text from input box (not done automatically because this is not a submit button)

        new_div = document.createElement('div');
        new_div.setAttribute("id", "comment_block_" + j);
        new_div.setAttribute("class", "comment_block");

        new_span = document.createElement('span');
        new_span.setAttribute("class", "comment_text");

        new_button = document.createElement('button');
        new_button.setAttribute("id", "delete_comment_" + j);
        new_button.setAttribute("class", "delete_button");
        new_button.setAttribute("title", "delete comment");

        new_text = document.createTextNode(new_comment);
        x_text = document.createTextNode("x")

        new_span.appendChild(new_text);
        new_button.appendChild(x_text)
        new_div.appendChild(new_span);
        new_div.appendChild(new_button);

        document.getElementById("current_comments").appendChild(new_div);

        deleteCommentFunction(j, current_comments, url, (deleteFunction) => {
          document.getElementById("delete_comment_" + j.toString()).addEventListener("click", deleteFunction);
          document.getElementById('comment_text').value = "";
        });
      });

      for (i = 0; i < current_comments.length; i++){
        //setting listeners for delete buttons
        deleteCommentFunction(i, current_comments, url, (deleteFunction) => {
          document.getElementById("delete_comment_" + i.toString()).addEventListener("click", deleteFunction);
          document.getElementById('comment_text').value = "";
        });

      }
    });
  });
});

