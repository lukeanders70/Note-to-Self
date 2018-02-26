//The HTML needed to inject for each comment. By splitting it up into start, middle end
//it is possible to dynamically construct the unique html code each comment requires
var comment_block_html_1 = "<div class='comment_block' id=";
var comment_block_html_2 = "'><span class='comment_text'>";
var comment_block_html_3 = "</span><button id=";
var comment_block_html_4 = ">Delete</button></div>";

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
    console.log(current_comments)
    for (i = 0; i < current_comments.length; i++){
      document.getElementById("current_comments").innerHTML = document.getElementById("current_comments").innerHTML +
                                                              comment_block_html_1 +
                                                              "'comment_block_" + i + "'" +
                                                              comment_block_html_2 +
                                                              current_comments[i] +
                                                              comment_block_html_3 +
                                                              "'delete_comment_" + i + "'" +
                                                              comment_block_html_4;
    }
  });
}

function deleteCommentFunction(i, current_comments, url){
  var delete_i = function(){
    document.getElementById("comment_block_" + i.toString()).remove();
    current_comments.splice(i, 1);
    var comments_for_storage = {};
    comments_for_storage[url] = current_comments;
    chrome.storage.sync.set(comments_for_storage);
  }
  return delete_i
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

        //add the newest comment to the display and remove text from input box (not done automatically because this is not a submit button)
        document.getElementById("current_comments").innerHTML = document.getElementById("current_comments").innerHTML +
                                                              comment_block_html_1 +
                                                              "'comment_block_" + i + "'" +
                                                              comment_block_html_2 +
                                                              new_comment +
                                                              comment_block_html_3 +
                                                              "'delete_comment_" + i + "'" +
                                                              comment_block_html_4;
        document.getElementById('comment_text').value = "";
      });

      for (i = 0; i < current_comments.length; i++){
        //setting listeners for delete buttons
        document.getElementById("delete_comment_" + i.toString()).addEventListener("click", deleteCommentFunction(i, current_comments, url));

      }
    });
  });
});

