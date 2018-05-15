
// GLOBALS
var current_comments = {};
var url = "";
var domain = "";

var get_current_comments = function(){
    var all_comments = {};

    //get domain comments
    chrome.storage.sync.get(domain, (comments) => {
        callback(chrome.runtime.lastError ? null : all_comments["domain"] = comments);
    });

    //get url comments
    chrome.storage.sync.get(url, (url) => {
        callback(chrome.runtime.lastError ? null : all_comments["url"] = comments);
    });

    return all_comments;
}

var load_comment = function(comment, i){
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

    document.getElementById("current_comments").appendChild(new_div);
}

var load_current_comments = function(){

    document.getElementById("current_comments_domain").innerHTML = "";
    document.getElementById("url_comments_domain").innerHTML = "";

    current_comments = get_current_comments();

    for (var i = 0; i < current_comments["domain"].length; i++){
        load_comment(current_comments["domain"][i], i);
        delete_function = delete_comment_function(i)
        document.getElementById("delete_comment_" + i.toString()).addEventListener("click", delete_function);
    }

    for (var i = current_comments["domain"].length; i < current_comments["url"].length + current_comments["domain"].length; i++){
        load_comment(current_comments["url"][i], i);
        delete_function = delete_comment_function(i);
        document.getElementById("delete_comment_" + i.toString()).addEventListener("click", delete_function);

    }

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

        document.getElementById("comment_button").addEventListener("click", add_comment)

    });
});