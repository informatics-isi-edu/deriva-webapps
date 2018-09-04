var fs = require('fs');

function init() {
    console.log('**Parser Started**');
    start();
}
var data;
var jsonData;
var forest={};
function removeParent(presentationData){

    if(presentationData.children.length ==0){
        presentationData['type'] = 'file';
    }
    for(var c=0;c<presentationData.children.length;c++){
        presentationData['type'] = 'folder';
        removeParent(presentationData.children[c]);
    }
    delete presentationData.parent;
}
function buildTree(presentationData){
    for(var z=0; z< presentationData.length; z++){
        removeParent(presentationData[z]);
    }
    return presentationData;
}
 function start(){
      var presentationData =[];
      // Returns json - Query 1 : https://dev.rebuildingakidney.org/ermrest/catalog/2/attribute/M:=Vocabulary:Anatomy_Part_Of/F1:=left(subject_dbxref)=(Anatomy_terms:dbxref)/$M/F2:=left(object_dbxref)=(Anatomy_terms:dbxref)/$M/subject_dbxref:=M:subject_dbxref,object_dbxref,subject:=F1:name,object:=F2:name
      // Returns extraAttributes - Query 2 : https://dev.rebuildingakidney.org/ermrest/catalog/2/attribute/M:=Gene_Expression:Specimen_Expression/RID=Q-PQ16/$M/RID:=M:RID,Region:=M:Region,strength:=M:Strength,pattern:=M:Pattern,density:=M:Density,densityChange:=M:Density_Direction,densityNote:=M:Density_Note
      // Returns isolated nodes - Query 3 : https://dev.rebuildingakidney.org/ermrest/catalog/2/attribute/t:=Vocabulary:Anatomy_terms/s:=left(dbxref)=(Vocabulary:Anatomy_Part_Of:subject_dbxref)/subject_dbxref::null::/$t/o:=left(dbxref)=(Vocabulary:Anatomy_Part_Of:object_dbxref)/object_dbxref::null::/$t/dbxref:=t:dbxref,name:=t:name
      var json = JSON.parse(fs.readFileSync('gudmap_data.json', 'utf8'));
      var extraAttributes = JSON.parse(fs.readFileSync('extra_attributes.json', 'utf8'));
      var isolatedNodes = JSON.parse(fs.readFileSync('isolated_nodes.json', 'utf8'));
      var Region = extraAttributes[0].Region;
      var showAnnotation = true;

      forest= processData(json, extraAttributes[0], showAnnotation, isolatedNodes);
      var presentationData =[];

      for(var g=0; g< forest.trees.length; g++)
          presentationData.push(forest.trees[g].node);

        var finalData = buildTree(presentationData);
          const content = JSON.stringify(finalData);
          //console.log(content);
      if(showAnnotation == false) {
        fs.writeFile("gudmap_parsed.json", content, 'utf8', function (err) {
            if (err) {
                return console.log(err);
            }

            console.log("The file was saved!");
        });
      }
      else {
        fs.writeFile("gudmap_parsed_with_annotation.json", content, 'utf8', function (err) {
            if (err) {
                return console.log(err);
            }

            console.log("The file was saved!");
        });
      }
          console.log("**END**");
}

function processData(data, extraAttributes, showAnnotation, isolatedNodes){
  var subjectText = data[0].subject,
      objectText= data[0].object;
  if(showAnnotation && data[0].object_dbxref == extraAttributes.Region) {
    var densityIcon= getDensityIcon(extraAttributes.density),
    densityChangeIcon= getDensityChangeIcon(extraAttributes.densityChange),
    densityNoteIcon= getDensityNoteIcon(extraAttributes.densityNote),
    densityNote= extraAttributes.densityNote,
    patternIcon= getPatternIcon(extraAttributes.pattern),
    strengthIcon= getStrengthIcon(extraAttributes.strength),
    densityImgSrc = densityIcon != '' ? "<img src="+densityIcon+"></img>" : "",
    patternImgSrc = patternIcon != '' ? "<img src="+patternIcon+"></img>" : "",
    strengthImgSrc = strengthIcon != '' ? "<img src="+strengthIcon+"></img>" : "",
    densityChangeImgSrc = densityChangeIcon != '' ? "<img src="+densityChangeIcon+"></img>" : "",
    densityNoteImgSrc = densityNote != '' && densityNote != null ? "<img src="+densityNoteIcon+" title='"+densityNote+"'></img>" : ""
    objectColumnData = "<span>"+strengthImgSrc+"<span>"+objectText+"</span>"+densityImgSrc+patternImgSrc+densityChangeImgSrc+densityNoteImgSrc+"</span>"
  }
  else {
    objectColumnData = "<span>"+objectText+"</span>"
  }
  if(showAnnotation && data[0].subject_dbxref == extraAttributes.Region) {
    var densityIcon= getDensityIcon(extraAttributes.density),
    densityChangeIcon= getDensityChangeIcon(extraAttributes.densityChange),
    densityNoteIcon= getDensityNoteIcon(extraAttributes.densityNote),
    densityNote= extraAttributes.densityNote,
    patternIcon= getPatternIcon(extraAttributes.pattern),
    strengthIcon= getStrengthIcon(extraAttributes.strength),
    densityImgSrc = densityIcon != '' ? "<img src="+densityIcon+"></img>" : "",
    patternImgSrc = patternIcon != '' ? "<img src="+patternIcon+"></img>" : "",
    strengthImgSrc = strengthIcon != '' ? "<img src="+strengthIcon+"></img>" : "",
    densityChangeImgSrc = densityChangeIcon != '' ? "<img src="+densityChangeIcon+"></img>" : "",
    densityNoteImgSrc = densityNote != '' && densityNote != null ? "<img src="+densityNoteIcon+" title='"+densityNote+"'></img>" : ""
    subjectColumnData = "<span>"+strengthImgSrc+"<span>"+objectText+"</span>"+densityImgSrc+patternImgSrc+densityChangeImgSrc+densityNoteImgSrc+"</span>"
  }
  else {
    subjectColumnData = "<span>"+subjectText+"</span>"
  }

    var parent =  {
        text :  objectColumnData ,
        parent : [],
        children : [],
        dbxref : data[0].object_dbxref,
        a_attr      :
            {
                'href': '/chaise/record/#2/Vocabulary:Anatomy_terms/dbxref='+data[0].object_dbxref.replace(/:/g,'%3A'),
                'style': 'display:inline;'
            }
    };
    var child =  {
        text :  subjectColumnData,
        parent : [],
        children : [],
        dbxref : data[0].subject_dbxref,
        a_attr      :
            {
                'href': '/chaise/record/#2/Vocabulary:Anatomy_terms/dbxref='+data[0].subject_dbxref.replace(/:/g,'%3A'),
                'style': 'display:inline;'
            }
    };
    var tree = new Tree(parent);
    var tree1 = new Tree(child);
    parent.children.push(child);
    child.parent.push(parent);
    //var tree = new Tree(parent);
    var forest = new Forest(parent);
    forest.trees.push(tree);
    // Get all isolated nodes as parent nodes
    for (var j =0;j <isolatedNodes.length; j++) {
      var parent =  {
          text :  "<span>"+isolatedNodes[j].name+"</span>" ,
          parent : [],
          children : [],
          dbxref : isolatedNodes[j].dbxref,
          a_attr      :
              {
                  'href': '/chaise/record/#2/Vocabulary:Anatomy_terms/dbxref='+isolatedNodes[j].dbxref.replace(/:/g,'%3A'),
                  'style': 'display:inline;'
              },
          li_attr : { "class" : "jstree-leaf"}
      };
      console.log(parent)
      var tree = new Tree(parent);
      forest.trees.push(tree);
    }


    for(var i =1 ;i <data.length; i ++){
        // if(data[i].object_dbxref == "UBERON:0010536:" || data[i].subject_dbxref == "UBERON:0010536:")
        //     console.log('found');
        var subjectText = data[i].subject,
            objectText= data[i].object;
        if(showAnnotation && data[i].object_dbxref == extraAttributes.Region) {
          var densityIcon= getDensityIcon(extraAttributes.density),
          densityChangeIcon= getDensityChangeIcon(extraAttributes.densityChange),
          densityNoteIcon= getDensityNoteIcon(extraAttributes.densityNote),
          densityNote= extraAttributes.densityNote,
          patternIcon= getPatternIcon(extraAttributes.pattern),
          strengthIcon= getStrengthIcon(extraAttributes.strength),
          densityImgSrc = densityIcon != '' ? "<img src="+densityIcon+"></img>" : "",
          patternImgSrc = patternIcon != '' ? "<img src="+patternIcon+"></img>" : "",
          strengthImgSrc = strengthIcon != '' ? "<img src="+strengthIcon+"></img>" : "",
          densityChangeImgSrc = densityChangeIcon != '' ? "<img src="+densityChangeIcon+"></img>" : "",
          densityNoteImgSrc = densityNote != '' && densityNote != null ? "<img src="+densityNoteIcon+" title='"+densityNote+"'></img>" : ""
          objectColumnData = "<span>"+strengthImgSrc+"<span>"+objectText+"</span>"+densityImgSrc+patternImgSrc+densityChangeImgSrc+densityNoteImgSrc+"</span>"
        }
        else {
          objectColumnData = "<span>"+objectText+"</span>"
        }
        if(showAnnotation && data[i].subject_dbxref == extraAttributes.Region) {
          var densityIcon= getDensityIcon(extraAttributes.density),
          densityChangeIcon= getDensityChangeIcon(extraAttributes.densityChange),
          densityNoteIcon= getDensityNoteIcon(extraAttributes.densityNote),
          densityNote= extraAttributes.densityNote,
          patternIcon= getPatternIcon(extraAttributes.pattern),
          strengthIcon= getStrengthIcon(extraAttributes.strength),
          densityImgSrc = densityIcon != '' ? "<img src="+densityIcon+"></img>" : "",
          patternImgSrc = patternIcon != '' ? "<img src="+patternIcon+"></img>" : "",
          strengthImgSrc = strengthIcon != '' ? "<img src="+strengthIcon+"></img>" : "",
          densityChangeImgSrc = densityChangeIcon != '' ? "<img src="+densityChangeIcon+"></img>" : "",
          densityNoteImgSrc = densityNote != '' && densityNote != null ? "<img src="+densityNoteIcon+" title='"+densityNote+"'></img>" : ""
          subjectColumnData = "<span>"+strengthImgSrc+"<span>"+objectText+"</span>"+densityImgSrc+patternImgSrc+densityChangeImgSrc+densityNoteImgSrc+"</span>"
        }
        else {
          subjectColumnData = "<span>"+subjectText+"</span>"
        }

        var parent =  {
            text :  objectColumnData,
            parent : [],
            children : [],
            dbxref : data[i].object_dbxref,
            a_attr      : {'href': '/chaise/record/#2/Vocabulary:Anatomy_terms/dbxref='+data[i].object_dbxref.replace(/:/g,'%3A')}
        };
        var child =  {
            text :  subjectColumnData,
            parent : [],
            children : [],
            dbxref : data[i].subject_dbxref,
            a_attr      : {'href': '/chaise/record/#2/Vocabulary:Anatomy_terms/dbxref='+data[i].subject_dbxref.replace(/:/g,'%3A')}
        };
        var tree = new Tree(parent);
        var tree1 = new Tree(child);
        parent.children.push(child);
        child.parent.push(parent);
        var added = false;
        var parentNode =false;
        var childNode = false;
        var childIndex =-1;
        var parentIndex =-1;
        for(var f=0; f<forest.trees.length && !added;f++){
            var tree= forest.trees[f];

            if(!parentNode){
                 parentNode = tree.contains(tree, data[i].object_dbxref);
                 if(parentNode)
                    parentIndex= f;
            }
            if(!childNode){
                 childNode = tree.contains(tree, data[i].subject_dbxref);
                 if(childNode)
                    childIndex= f;
            }
        }
        //parent and child both not found
        // add this as a new tree and add to forest
        if(!parentNode && !childNode){
            var tree = new Tree(parent);
            forest.trees.push(tree);
        }
        //parent node exist, add child to parent node
        else if(parentNode && !childNode){
            parentNode.children.push(child);
        }
        //child node exist, add parent to child node
        //delete child from the forest as child is no longer root
        else if(!parentNode && childNode){
            parent.children.pop();
            parent.children.push(childNode);
            childNode.parent.push(parent);
            tree = new Tree(parent);
            jloop:
            for(var t=0; t< forest.trees.length; t++){
                if(forest.trees[t].node.dbxref == childNode.dbxref){
                    //console.log(forest.trees[t].node.text);
                    forest.trees.splice(t,1);
                    break jloop;
                }
            }
            forest.trees.push(tree);
        }
        //child and parent node, both are present then add child to parent
        //and remove the child form the forest
        else if(parentNode && childNode){
            parentNode.children.push(childNode);
            ploop:
            for(var q=0; q< forest.trees.length; q++){
                if(forest.trees[q].node.dbxref == childNode.dbxref){
                    //console.log(forest.trees[q].node.text);
                    forest.trees.splice(q,1);
                    break ploop;
                }
            }
        }
    }

    return (forest);

}
function Queue(){var a=[],b=0;this.getLength=function(){return a.length-b};this.isEmpty=function(){return 0==a.length};this.enqueue=function(b){a.push(b)};this.dequeue=function(){if(0!=a.length){var c=a[b];2*++b>=a.length&&(a=a.slice(b),b=0);return c}};this.peek=function(){return 0<a.length?a[b]:void 0}};
function Tree(node) {
    var linkId= node.dbxref.replace(/:/g,'%3A');
    var s= node.a_attr;
    var l = "'/chaise/record/#2/Vocabulary:Anatomy_terms/dbxref="+linkId+"','_blank'";
    s["onClick"]="window.open("+l+");";
    var node = { text: node.text, dbxref: node.dbxref, children :node.children,
         parent: node.parent,a_attr : s};
    this.node = node;
}
var tress=[];
function Forest(node) {
    var tree = new Tree(node);
    this.trees = [];
}
function getDensityIcon(density) {
  switch(density) {
    case 'High':
        return "resources/images/NerveDensity/RelativeToTotal/high.png";
    case 'Low':
        return "resources/images/NerveDensity/RelativeToTotal/low.png";
    case 'Medium':
        return "resources/images/NerveDensity/RelativeToTotal/medium.png";
    default:
        return "";
  }
}
function getDensityChangeIcon(densityChange) {
  switch(densityChange) {
    case 'Decreased':
        return "resources/images/NerveDensity/RelativeToP0/dec_small.png";
    case 'Increased':
        return "resources/images/NerveDensity/RelativeToP0/inc_small.png";
    // case 'No Change':
    //     return "resources/images/NerveDensity/RelativeToP0/medium.png";
    default:
        return '';
  }
}
function getDensityNoteIcon(densityNote) {
    if(densityNote != null)
      return "resources/images/NerveDensity/note.gif";
    else
      return "";
}
function getPatternIcon(pattern) {
  switch(pattern) {
    case 'graded':
        return "resources/images/ExpressionMapping/ExpressionPatternKey/Graded.png";
    case 'homogeneous':
        return "resources/images/ExpressionMapping/ExpressionPatternKey/homogeneous.png";
    case 'regional':
        return "resources/images/ExpressionMapping/ExpressionPatternKey/Regional.png";
    case 'restricted':
        return "resources/images/ExpressionMapping/ExpressionPatternKey/Restricted.png";
    case 'single cell':
        return "resources/images/ExpressionMapping/ExpressionPatternKey/SingleCell.png";
    case 'spotted':
        return "resources/images/ExpressionMapping/ExpressionPatternKey/Spotted.png";
    case 'ubiquitous':
        return "resources/images/ExpressionMapping/ExpressionPatternKey/Ubiquitous.png";
    default:
        return "";
  }
}
function getStrengthIcon(strength) {
  switch(strength) {
    case 'not detected':
        return "resources/images/ExpressionMapping/ExpressionStrengthsKey/notDetected.gif";
    case 'uncertain':
        return "resources/images/ExpressionMapping/ExpressionStrengthsKey/Uncertain.gif";
    case 'present':
        return "resources/images/ExpressionMapping/ExpressionStrengthsKey/Present(unspecifiedStrength).gif";
    default:
        return "";
  }
}
Tree.prototype.traverseBF = function(dbxref) {
    var queue = new Queue();
    queue.enqueue(this.node);
    currentNode = queue.dequeue();

    while(currentNode){
        for (var i = 0, length = currentNode.children.length; i < length; i++) {
            queue.enqueue(currentNode.children[i]);
        }
        if(currentNode.dbxref == dbxref)
            return currentNode;
        currentNode = queue.dequeue();
    }
};
Tree.prototype.contains = function(tree, dbxref) {
    return tree.traverseBF(dbxref);
};

Tree.prototype.add = function(data, toData, traversal) {
    var child =  { text: data,
            children:[],
            parent : [],
            callback : function(node) {
                if (node.text === toData.text) {
                    parent = node;
                }
            }};
    this.contains(child.callback, traversal);
    if (parent) {
        parent.children.push(child);
        child.parent = parent;
    } else {
        throw new Error('Cannot add node to a non-existent parent.');
    }
};
init();
