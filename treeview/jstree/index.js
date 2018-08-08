

window.onload = function() {
    start();
}
function search(){
    var v=  $('#plugins4_q').val();
    $('#using_json').jstree(true).search(v);
    // $("#using_json").jstree('search');
}
function reset(){
    document.getElementById('plugins4_q').value="";
     $("#using_json").jstree('clear_search');
     $("#using_json").jstree('close_all');
}

function expandAll(){

    $('.loader')[0].style.display="block";
    $('#mainDiv')[0].style.display="none";

    //$("#using_json").jstree('clear_search');
    $("#using_json").jstree(true).open_all();
    // var m = $('#using_json').jstree(true)._model.data, i;
    //
    //     for(i in m) {
    //         if(m.hasOwnProperty(i) && i !== '#') {
    //             m[i].state.opened = true;
    //         }
    //     }
    //     $('#using_json').jstree(true).redraw(true);
    $('.loader')[0].style.display="none";
    $('#mainDiv')[0].style.display="block";
}

function closeAll(){
    $("#using_json").jstree('close_all');
}


function buildTree(){
  $.getJSON("gudmap_parsed.json", function(presentationData) {
  $("div#jstree").jstree({
    plugins: ["themes","json","grid","search","sort", "types"],
    core: {
      data: presentationData
    },
    grid: {
      columns: [{width:2000}
      ]
    },
     types : {

        folder : {

          icon : "glyphicon glyphicon-tree-deciduous",
          valid_children : ["default"]
        },

        file : {
          icon : "glyphicon glyphicon-leaf",
          valid_children : []
        }
    },
    search: { show_only_matches : false, show_only_matches_children : false, close_opened_onclear: true}
  })
  document.getElementsByClassName('loader')[0].style.display="none";
  document.getElementById('plugins4_q').style.visibility="visible";
});
}
    $(function () {
      $("#plugins4").jstree({
        "plugins" : [ "search" ]
      });
      var to = false;
      $('#plugins4_q').keyup(function () {
        if(to) { clearTimeout(to); }
        to = setTimeout(function () {
          var v = $('#plugins4_q').val();
          $('#using_json').jstree(true).search(v);
      }, 1400);
      });
    });

function start(){
    buildTree();
}
