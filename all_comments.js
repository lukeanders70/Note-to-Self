current_comments = {}
var get_current_comments = function(callback){


    //get domain comments
    chrome.storage.sync.get(null, (comments) => {
        current_comments = comments;
        callback();
    });

}

var load_comment = function(comment, i, comment_type, j){
    var new_div = document.createElement('div');
    new_div.setAttribute("id", "comment_block_" + comment_type + "_" + j + "_" + i);
    new_div.setAttribute("class", "comment_block");

    var new_div_text = document.createElement('div');
    new_div_text.setAttribute("id", "comment_text_block_" + comment_type + "_" + j +"_" + i);
    new_div_text.setAttribute("class", "comment_text_block");

    var new_span = document.createElement('span');
    new_span.setAttribute("id", "comment_text_" + comment_type + "_" + j + "_" + i);
    new_span.setAttribute("class", "comment_text");

    var new_div_delete = document.createElement('div');
    new_div_delete.setAttribute("id", "comment_delete_block_" + comment_type + "_" + j + "_" + i);
    new_div_delete.setAttribute("class", "comment_delete_block");

    var new_button = document.createElement('button');
    new_button.setAttribute("id", "delete_comment_" + comment_type + "_" + j + "_" + i);
    new_button.setAttribute("class", "delete_button");
    new_button.setAttribute("title", "delete comment");

    var new_text = document.createTextNode(comment);
    var x_text = document.createTextNode("x")

    new_span.appendChild(new_text);
    new_button.appendChild(x_text);
    new_div_text.appendChild(new_span);
    new_div_delete.appendChild(new_button);
    new_div.appendChild(new_div_delete);
    new_div.appendChild(new_div_text);

    document.getElementById("comment_group_" + comment_type + "_" + j).appendChild(new_div);
}

var create_comment_group = function(i, comment_type, url){
    var new_div = document.createElement('div');
    new_div.setAttribute("id", "comment_group_" + comment_type + "_" + i);
    new_div.setAttribute("class", "comment_group");

    new_span = document.createElement('span');
    new_span.setAttribute("id", "comment_group_title_" + comment_type + "_" + i);
    new_span.setAttribute("class", "comment_group_title");

    var new_h3 = document.createElement('h3');
    new_h3.setAttribute("class", "comment_group_h3");

    var new_link = document.createElement('a');
    new_link.setAttribute("class", "comment_group_link");
    if(comment_type == "url"){
        new_link.setAttribute("href", url);
    }
    else{
        new_link.setAttribute("href", "https://" + url);
    }

    new_text = document.createTextNode(url);

    new_span.appendChild(new_h3);
    new_h3.appendChild(new_link)
    new_link.appendChild(new_text)
    new_div.appendChild(new_span);
    document.getElementById("current_comments_" + comment_type).appendChild(new_div);
}

var domain_or_url = function(string){
    if(string.includes(":")){
        return "url"
    }
    else{
        return "domain"
    }
}

var load_current_comments = function(){

    get_current_comments(function(){

        console.log("here")

        document.getElementById("current_comments_url").innerHTML = "";
        document.getElementById("current_comments_domain").innerHTML = "";

        var keys = Object.keys(current_comments)

        for(var i = 0; i < keys.length; i++){

            let key = keys[i];
            let comment_type = domain_or_url(key);
            let comments = current_comments[key];
            if(comments.length  == 0){
                chrome.storage.sync.remove(key);
            }
            else{
                create_comment_group(i, comment_type, key);
            }

            for(j = 0; j < comments.length; j++){
                comment = comments[j];
                load_comment(comment, j, comment_type, i);
                delete_function = delete_comment_function(j, "domain", key);
                document.getElementById("delete_comment_" + comment_type + "_" + i + "_" + j).addEventListener("click", delete_function);
            }
        }

        if(document.getElementById("current_comments_url").childElementCount == 0){
            //load 'no notes' image
            no_notes_img = document.createElement("img");
            no_notes_img.setAttribute("id", "no_notes_img");
            no_notes_img.setAttribute("src", "./no_notes.png");
            document.getElementById("current_comments_url").appendChild(no_notes_img);
        }
        if(document.getElementById("current_comments_domain").childElementCount == 0){
            //load 'no notes' image
            no_notes_img = document.createElement("img");
            no_notes_img.setAttribute("id", "no_notes_img");
            no_notes_img.setAttribute("src", "./no_notes.png");
            document.getElementById("current_comments_domain").appendChild(no_notes_img);
        }


    });

}
var delete_comment_function = function(comment_num, comment_type, key){

    var delete_i = function(){
        current_comments[key].splice(comment_num,1);

        new_comments = {}
        new_comments[key] = current_comments[key]
        chrome.storage.sync.set(new_comments);

        load_current_comments();
    }

    return delete_i;
};

var switch_to_url = function(){
    //show url comments, hide domain comments
    document.getElementById("domain_comments_tab").style.display = "none";
    document.getElementById("url_comments_tab").style.display = "block";

    //show url tab as active, show domain tab as inactive
    document.getElementById("domain_comments_tab_button").style.color = "#a5a5a5";
    document.getElementById("url_comments_tab_button").style.color = "black";
}

var switch_to_domain = function(){
    document.getElementById("url_comments_tab").style.display = "none";
    document.getElementById("domain_comments_tab").style.display = "block";

    document.getElementById("url_comments_tab_button").style.color = "#a5a5a5";
    document.getElementById("domain_comments_tab_button").style.color = "black";

}



document.addEventListener('DOMContentLoaded', () => {

        load_current_comments();
        document.getElementById("url_comments_tab_button").addEventListener("click", switch_to_url);
        document.getElementById("domain_comments_tab_button").addEventListener("click", switch_to_domain);
});