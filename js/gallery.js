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

function select(element){
    var img = element.className.split(" ")[2];
    
    // TRUE: ONLY ONE DELETION
    // FALSE: ONE OR MORE DELETIONS
    if(false)
    {
        for(var i = 0; i < imagesCounter; i++)
        {
            var ids = ".image" + i;
            $(ids).removeClass("img-active");
        }
    }
    
    if($("." + img).hasClass("img-active"))
        $("." + img).removeClass("img-active");
    else 
        $("." + img).addClass("img-active");
}

function deleteImage(){
    
    var pending = [];
    var pending_index = [];
    
    for(var i = 0; i < imagesCounter; i++)
    {
        var img = ".image" + i;
        if($(img).hasClass("img-active")){
            pending.push($(img));
            pending_index.push(i);
        }
    }
    
    if(!pending.length)
        return;
    
    for(var i = 0; i < pending.length; i++)
    {
        var curr = pending[i];
        curr.parent().remove();
        copy.deleteExtra(pending_index[i]);    
    }
    
    updateGallery();
}
