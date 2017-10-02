var conditional = true;

$(document).keyup(function(e){
    if(e.keyCode == 27)
        openMiniGallery(true);
});

function openMiniGallery(flag)
{
    if(flag)
        conditional = true;
    else
        conditional = !conditional;
    
    if(!conditional){
        $("#img-content").css("margin-left", "0");
        $("#img-content").css("height", "200px");
        $("#img-content").css("margin-bottom", "10px");
    }
        
    else{
        $("#img-content").css("margin-left", "-2999px");
        $("#img-content").css("height", "0");
        $("#img-content").css("margin-bottom", "0");
    }
}

/*
* Receives a dom element and adds a class to it.
* @param element  (dom element which has to have border as active one)
* @param type  (text, pdf, image, youtube)
*/

function select(element, type){
    
//    console.log("selected")
    
    var img = null, size = null;
    
    if(type == "text"){
        img = element.className.split(" ")[1];
    }
        
    else{
        img = element.className.split(" ")[2];
    }
    
    var classtype = type + "-active";
    
    // #TRUE: ONLY ONE DELETION
    // #FALSE: ONE OR MORE DELETIONS
    if(false)
    {
        for(var i = 0; i < extraCounter; i++)
        {
            var ids = "." + type + i;
            $(ids).removeClass(classtype);
        }
    }
    
    if($("." + img).hasClass(classtype))
        $("." + img).removeClass(classtype);
    else 
        $("." + img).addClass(classtype);
}

/*
* Deletes one or more elements from the dom and the extra
* list of the project
* @param type  (text, pdf, image, youtube)
*/

function deleteElement(type){
    
    var pending = [];
    var classtype = type + "-active";
    var size = null;
    
    for(var i = 0; i < copy._extra.length; i++)
    {
        var extra = copy._extra[i];
        
        if(extra.type != type)
            continue;
        
        var sel = "." + extra.name;
        if($(sel).hasClass(classtype)){
            pending.push($(sel));
        }
    }
    
    if(!pending.length)
    {
        console.error("nothing to delete");
        return;
    }
    
    for(var i = 0; i < pending.length; i++)
    {
        var sel = pending[i]; // $(...)
        copy.deleteExtra(sel, type);    
        sel.remove();
    }
    
    SlickJS.stop();        
    parseExtraJSON(copy._extra, {parseAll: true});
    SlickJS.init();
}

// SLICK JS //

var SlickJS = {
    
    on: false,
  
    init: function(){
        
        SlickJS.on = true;

      $('.slick01').slick({
          infinite: true,
          autoplay: true,
          autoplaySpeed: 3000,
          touchMove: false,
          arrows: false,
          speed: 200,
          pauseOnFocus: true,
          slidesToShow: 4,
          slidesToScroll: 4,
          responsive: [
            {
              breakpoint: 1280,
              settings: {
                slidesToShow: 3,
                slidesToScroll: 3,
              }
            },
            {
              breakpoint: 993,
              settings: {
                slidesToShow: 2,
                slidesToScroll: 2,
              }
            },
            {
              breakpoint: 680,
              settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
              }
            }
          ]
      });
        
    },
    
    stop: function(){
        $('.slick01').slick('unslick');
        this.on = false;
    },
    
    refresh: function(){
        
        if(SlickJS.on){
            this.stop();
            this.on = true;
        }
        
        this.init();    
    
    }
};

$(window).load(function() {
    
});