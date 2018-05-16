
// GLOBALS
var current_comments = {"domain":[], "url":[]};
var url = "";
var domain = "";

function getDomain(url, callback) {
  console.log(url.split("://")[1].split("/")[0]);
  callback(url.split("://")[1].split("/")[0]);
}

function getUrl(callback) {
  var request = {currentWindow: true, active: true};

  chrome.tabs.query(request, (result) => {
    var tab = result[0];
    var current_url = tab.url;
    getDomain(current_url, (domain) => {
      callback(current_url, domain);
    });
  });
}

var get_current_comments = function(callback){


    //get domain comments
    chrome.storage.sync.get(domain, (comments) => {
        if(comments[domain] != null){
            current_comments["domain"] = comments[domain];
        }

        //get url comments
        chrome.storage.sync.get(url, (comments) => {
            if(comments[url] != null){
                current_comments["url"] = comments[url];
            }
            callback();
        });
    });

}

var load_comment = function(comment, i, comment_type){
    var new_div = document.createElement('div');
    new_div.setAttribute("id", "comment_block_" + i);
    new_div.setAttribute("class", "comment_block");

    var new_span = document.createElement('span');
    new_span.setAttribute("class", "comment_text");

    var new_button = document.createElement('button');
    new_button.setAttribute("id", "delete_comment_" + i);
    new_button.setAttribute("class", "delete_button");
    new_button.setAttribute("title", "delete comment");

    var new_text = document.createTextNode(comment);
    var x_text = document.createTextNode("x")

    new_span.appendChild(new_text);
    new_button.appendChild(x_text)
    new_div.appendChild(new_span);
    new_div.appendChild(new_button);

    document.getElementById("current_comments_" + comment_type).appendChild(new_div);
}

var load_current_comments = function(){

    document.getElementById("current_comments_domain").innerHTML = "";
    document.getElementById("current_comments_url").innerHTML = "";

    get_current_comments(function(){
        for (var i = 0; i < current_comments["domain"].length; i++){
            load_comment(current_comments["domain"][i], i, "domain");
            delete_function = delete_comment_function(i)
            document.getElementById("delete_comment_" + i.toString()).addEventListener("click", delete_function);
        }

        for (var i = 0; i < current_comments["url"].length; i++){
            console.log(i)
            load_comment(current_comments["url"][i], i + current_comments["domain"].length, "url");
            delete_function = delete_comment_function(i);
            document.getElementById("delete_comment_" + (i + current_comments["domain"].length).toString()).addEventListener("click", delete_function);

        }
    });

}

var add_comment_url = function(){
    var new_comment = document.getElementById('comment_text').value;

    if (current_comments["url"] === undefined || current_comments["url"].length == 0){
      current_comments["url"] = [new_comment];
    }
    else{
      current_comments["url"].push(new_comment);
    }

    var comments_for_storage = {};
    comments_for_storage[url] = current_comments["url"];
    chrome.storage.sync.set(comments_for_storage);

    load_current_comments(); //reload the comments now that we've added one

    document.getElementById('comment_text').value = ""; //remove text from input box    
}

var delete_comment_function = function(i){

    var delete_i = function(){
        document.getElementById("comment_block_" + i.toString()).remove();

        current_comments.splice(i,1);
        var comments_for_storage = {};
        comments_for_storage[url] = current_comments;
        chrome.storage.sync.set(comments_for_storage);

        load_current_comments();
    }

    return delete_i;
};

document.addEventListener('DOMContentLoaded', () => {
    getUrl((new_url, new_domain)=>{
        url = new_url;
        domain = new_domain;
        load_current_comments();

        document.getElementById("comment_button").addEventListener("click", add_comment_url)

    });
});