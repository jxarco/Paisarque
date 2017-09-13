//current position
var pos = 0;
var conditional = true;
//number of slides
var totalSlides = $('#gall-wrap ul li').length;
//get the slide width
var sliderWidth = $('#gall-wrap').width();

//hide tutorial messages
setTimeout(function(){
    $(".tutorial").fadeOut();
}, 5000)

$(".tutorial").click(function(){
     $(this).fadeOut();
});

//set width to be 'x' times the number of slides
$('#gall-wrap ul#gall').width(sliderWidth*totalSlides);

$('#next').click(function(){
    slideRight();
});

$('#previous').click(function(){
    slideLeft();
});

//for each slide 
$.each($('#gall-wrap ul li'), function() { 
   //set its color
   var c = $(this).attr("data-color");
   $(this).css("background",c);
});

countSlides();

//hide/show controls/btns when hover
//pause automatic slide when hover
$('#gall-wrap').hover(
  function(){ $(this).addClass('active'); }, 
  function(){ $(this).removeClass('active'); }
);

/***********
 SLIDE LEFT
************/
function slideLeft(){
    pos--;
    if(pos==-1){ pos = totalSlides-1; }
    $('#gall-wrap ul#gall').css('left', -(sliderWidth*pos)); 	

    //*> optional
    countSlides();
}

function slideRight(){
    pos++;
    if(pos==totalSlides){ pos = 0; }
    $('#gall-wrap ul#gall').css('left', -(sliderWidth*pos)); 

    //*> optional 
    countSlides();
}

function countSlides(){
    $('#counter').html(pos+1 + ' / ' + totalSlides);
}

function updateGallery(){
    totalSlides = $('#gall-wrap ul li').length;
    sliderWidth = $('#gall-wrap').width();

    $('#gall-wrap ul#gall').width(sliderWidth*totalSlides);

    $.each($('#gall-wrap ul li'), function() { 
       var c = $(this).attr("data-color");
       $(this).css("background",c);
    });

    countSlides();
    
    if(!$('#gall-wrap ul li').length){
        openMiniGallery();
    }
}


// minigallery

$(document).keyup(function(e){
    if(e.keyCode == 27)
        openMiniGallery();
});

function openMiniGallery()
{
    conditional = !conditional;
    if(!conditional){
        $("#img-content").css("margin-left", "0");
        $("#img-content").css("height", "175px");
        $("#img-content").css("margin-bottom", "10px");
    }
        
    else{
        $("#img-content").css("margin-left", "-2999px");
        $("#img-content").css("height", "0");
        $("#img-content").css("margin-bottom", "0");
    }
}

function select(element, type){
    
    var img = null, size = null;
    
    if(type == "note"){
        img = element.className.split(" ")[1];
    }
        
    else{
        img = element.className.split(" ")[2];
    }
    
    var classtype = type + "-active";
    
    // TRUE: ONLY ONE DELETION
    // FALSE: ONE OR MORE DELETIONS
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

function deleteElement(type){
    
    var pending = [];
    var pending_index = [];
    var classtype = type + "-active";
    var size = null;
    
    for(var i = 0; i < extraCounter; i++)
    {
        var img = "." + type + i;
        if($(img).hasClass(classtype)){
            pending.push($(img));
            pending_index.push(i);
        }
    }
    
    if(!pending.length)
        return;
    
    for(var i = 0; i < pending.length; i++)
    {
        var curr = pending[i];
        if(type == "image")
            curr.parent().remove();
        else 
            curr.remove();
        copy.deleteExtra(type, pending_index[i]);    
    }
    
    updateGallery();
}
