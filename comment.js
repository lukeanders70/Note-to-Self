
// GLOBALS
var current_comments = {"domain":[], "url":[]};
var url = "";
var domain = "";

function getDomain(url, callback) {
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
    new_div.setAttribute("id", "comment_block_" + comment_type + "_" + i);
    new_div.setAttribute("class", "comment_block");

    var new_div_text = document.createElement('div');
    new_div_text.setAttribute("id", "comment_text_block_" + comment_type + "_" + i);
    new_div_text.setAttribute("class", "comment_text_block");

    var new_span = document.createElement('span');
    new_span.setAttribute("id", "comment_text_" + comment_type + "_" + i);
    new_span.setAttribute("class", "comment_text");

    var new_div_delete = document.createElement('div');
    new_div_delete.setAttribute("id", "comment_delete_block_" + comment_type + "_" + i);
    new_div_delete.setAttribute("class", "comment_delete_block");

    var new_button = document.createElement('button');
    new_button.setAttribute("id", "delete_comment_" + comment_type + "_" + i);
    new_button.setAttribute("class", "delete_button");
    new_button.setAttribute("title", "delete comment");

    var new_text = document.createTextNode(comment);
    var x_text = document.createTextNode("x")

    new_span.appendChild(new_text);
    new_button.appendChild(x_text);
    new_div_text.appendChild(new_span);
    new_div_delete.appendChild(new_button);
    new_div.appendChild(new_div_text);
    new_div.appendChild(new_div_delete);

    document.getElementById("current_comments_" + comment_type).appendChild(new_div);
}

var load_current_comments = function(){

    get_current_comments(function(){

        if(document.getElementById("no_notes_img_url")){
            document.getElementById("no_notes_img_url").remove();
        }
        if(document.getElementById("no_notes_img_domain")){
            document.getElementById("no_notes_img_domain").remove();
        }

        for (var i = 0; i < current_comments["domain"].length; i++){
            if(document.getElementById("comment_text_domain_" + i.toString())){
                document.getElementById("comment_text_domain_" + i.toString()).innerHTML = current_comments["domain"][i]
            }
            else{
                load_comment(current_comments["domain"][i], i, "domain");
                delete_function = delete_comment_function(i, "domain")
                document.getElementById("delete_comment_domain_" + i.toString()).addEventListener("click", delete_function);
            }
        }
        if(document.getElementById("comment_block_domain_" + (current_comments["domain"].length)) ){
            document.getElementById("comment_block_domain_" + (current_comments["domain"].length)).remove();
        }
        for (var i = 0; i < current_comments["url"].length; i++){
            if(document.getElementById("comment_text_url_" + i.toString())){
                document.getElementById("comment_text_url_" + i.toString()).innerHTML = current_comments["url"][i]
            }
            else{
                load_comment(current_comments["url"][i], i, "url");
                delete_function = delete_comment_function(i, "url")
                document.getElementById("delete_comment_url_" + i.toString()).addEventListener("click", delete_function);
            }
        }
        if(document.getElementById("comment_block_url_" + (current_comments["url"].length).toString())){
            document.getElementById("comment_block_url_" + (current_comments["url"].length).toString()).remove();
        }

        if(document.getElementById("current_comments_url").childElementCount == 0){
            //load 'no notes' image
            no_notes_img = document.createElement("img");
            no_notes_img.setAttribute("id", "no_notes_img_url");
            no_notes_img.setAttribute("class", "no_notes_img");
            no_notes_img.setAttribute("src", "./no_notes.png");
            document.getElementById("current_comments_url").appendChild(no_notes_img);
        }
        if(document.getElementById("current_comments_domain").childElementCount == 0){
            //load 'no notes' image
            no_notes_img = document.createElement("img");
            no_notes_img.setAttribute("id", "no_notes_img_domain");
            no_notes_img.setAttribute("class", "no_notes_img");
            no_notes_img.setAttribute("src", "./no_notes.png");
            document.getElementById("current_comments_domain").appendChild(no_notes_img);
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

var add_comment_domain = function(){
    var new_comment = document.getElementById('comment_text').value;

    if (current_comments["domain"] === undefined || current_comments["domain"].length == 0){
      current_comments["domain"] = [new_comment];
    }
    else{
      current_comments["domain"].push(new_comment);
    }

    var comments_for_storage = {};
    comments_for_storage[domain] = current_comments["domain"];
    chrome.storage.sync.set(comments_for_storage);

    load_current_comments(); //reload the comments now that we've added one

    document.getElementById('comment_text').value = ""; //remove text from input box    
}


var delete_comment_function = function(i, comment_type){

    var delete_i = function(){
        //document.getElementById("comment_block_" + i.toString()).remove();
        current_comments[comment_type].splice(i,1);
        var comments_for_storage = {};
        if(comment_type == "url") comments_for_storage[url] = current_comments[comment_type];
        if(comment_type == "domain") comments_for_storage[domain] = current_comments[comment_type];

        chrome.storage.sync.set(comments_for_storage);

        load_current_comments();
    }

    return delete_i;
};

var switch_to_url = function(){
    //show url comments, hide domain comments
    document.getElementById("domain_comments_tab").style.display = "none";
    document.getElementById("url_comments_tab").style.display = "block";

    //show url tab as active, show domain tab as inactive
    document.getElementById("domain_comments_tab_button").style.backgroundColor = "#545454";
    document.getElementById("url_comments_tab_button").style.backgroundColor = "#171717";

    //change comment button to post url comments
    document.getElementById("comment_button").removeEventListener("click", add_comment_domain);
    document.getElementById("comment_button").addEventListener("click", add_comment_url);
}

var switch_to_domain = function(){
    document.getElementById("url_comments_tab").style.display = "none";
    document.getElementById("domain_comments_tab").style.display = "block";

    document.getElementById("url_comments_tab_button").style.backgroundColor = "#545454";
    document.getElementById("domain_comments_tab_button").style.backgroundColor = "#171717";

    document.getElementById("comment_button").removeEventListener("click", add_comment_url);
    document.getElementById("comment_button").addEventListener("click", add_comment_domain);
}



document.addEventListener('DOMContentLoaded', () => {
    getUrl((new_url, new_domain)=>{
        url = new_url;
        domain = new_domain;
        load_current_comments();
        document.getElementById("domain_header").innerHTML = domain;
        document.getElementById("url_header").innerHTML = url;

        document.getElementById("comment_button").addEventListener("click", add_comment_url);
        document.getElementById("url_comments_tab_button").addEventListener("click", switch_to_url);
        document.getElementById("domain_comments_tab_button").addEventListener("click", switch_to_domain);
        document.getElementById("all_comments_button").addEventListener("click", function () {
            chrome.tabs.create({ url: chrome.runtime.getURL("all_comments.html") });
        });
    });
});