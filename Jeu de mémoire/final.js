/* au chargement on va definir les evenements sur les elements html, affichage
 du meilleur score enregistrees, meilleur temps, des regles de css sur le menu () */
$(document).ready(function(){
	
	$("#nouveau").on("click", commencerJeu);
	$("#jouer").on("click", commencerJeu);
	$("#quitter").on("click", terminerJeu);
	$("#pause").on("click",pause);
	$("#continuer").on("click",continuer);
	$("#BestScore").val(meilleurScore);
	
	$("#MeilleurTemps").val(meilleurTemps);
	
	$("#select").on("change",selectTableau);
	$("#continuer").hide();
	$("#pause").hide();
	$("#quitter").hide();
	navig();
});

var difficulteNbr=8; //pour le nombre de diffuclte on aura (8,12,16)on commencera par defaut a 8
var meilleurScore=localStorage.getItem("meilleurScore");//le meilleure score atteint
var meilleurTemps= localStorage.getItem("meilleurTemps");// le meilleur temps atteint
var paireTab = new Array();// contient 2 element paires au maximum
var seconde=0; // l increment de seconde. on l initialise a 0
var score=0; // le score designe le score en cours
var bonus= 40; // le bonus pour compter le score il varie selon le temps initialement il est a 40
var chrono; // retourne le temps avec intervalle de 1 seconde

/* recupere la difficulte que je vais selectioner 8.12 ou 16 (event change) */
function selectTableau(event)
{
	difficulteNbr= event.currentTarget.value; 
}

/* cette fonction me permet d ajouter a mon div dynamiquement un certain nombre d image identiques
 ces images cacher  les images cachees */
function cloner(nbImg)
{
	var image = document.createElement("img");
	$(image).addClass("col-xs-3 col-lg-3");
	image.src="images/img0.jpg";
	image.hidden="true";
	
	for (var i=0; i<nbImg; i++)
	{
		$("#tableau").append($(image).clone());
	}	
}

/* cette fonction me permet d obtenir a chaque fois un Nouveautableau avec des doublons des images ajouters*/
function calculNvTab()
{
	var tabimages= $("#tableau img");// servira a recuperer un tableau d images qui change dynamiquement de taillle, apres le clonage des photos dans la div tableau
	var nbImages= tabimages.length/2; // servira pour choisir le nombre d images vont etre rajoutes sur un maximum de 16
	
	var imgTab= new Array (
		"images/tigre1.jpg",
		"images/tigre2.jpg",
		"images/tigre3.jpg",
		"images/tigre4.jpg",
		"images/tigre5.jpg",
		"images/tigre6.jpg",
		"images/tigre7.jpg",
		"images/tigre8.jpg"
		);
		
	var nouveauTab= imgTab.slice(0,nbImages);
	nouveauTab = nouveauTab.concat(nouveauTab);
	
	return nouveauTab;	
}

/*c'est la fonction  qui permet d initaliser le jeu associer a l evenement 
click sur le bouton commenecr jeu*/
function commencerJeu() 
{
	$("#pause").show();
	$("#quitter").show();
	$("#continuer").hide();
	$("#tableau").empty(); //vider le tableau des images cloner au debut pour reinitaliser le niveau de difficulte
	cloner(difficulteNbr); //difficulteNbr est le nombre d image a generer selon le choix de l utilisateur 
	clearInterval(chrono); // on arrete le temps
	seconde=0;
	score=0;
	bonus=40;
	$("#score").val(score);
	chrono= setInterval(function(){temps();},1000);
	paireTab = new Array(); 
	var imgTab= calculNvTab();// on obtient le nouveau tableau sur le quel on va travailler	
	var $imgs= $( "#tableau img" );
	$imgs.show( "slow");
	/*pour chaque image du div je choisis une image aleatoire de mon nouveau tableau , 
	je la sauvegarde et je donne le click une seule fois pour retourner l image*/
	$imgs.each(function(){ 
		var rand = randomImages(imgTab); 
		$(this).data("imgCache",rand); 
		$(this).attr("src","images/img0.jpg");
		$(this).off();
		$(this).one("click", {laCarte:this}, retourner);
	});		
}

/*  associer a l event click sur le bouton quitter .le joueur decide de quitter le jeux on remet le compte le tout a l etat initial:
les images cachees, on arrete les clicks, on remet le score a 0, le temps on l arrete et on cache les boutons qu on a pas besoin. */
function terminerJeu()
{
	var $imgs= $( "#tableau img" );
		
	$imgs.each(function(){
			
		$(this).attr("src","images/img0.jpg");
		$(this).off();
	});	
	$("#score").val(0);
	clearInterval(chrono);
	$imgs.hide( "slow");
	$("#continuer").hide();
	$("#pause").hide();
	$("#quitter").hide();					
	paireTab = new Array();
}

/* pour genrer l evenement click sur le bouton pause: on desactive l evenement click pour toutes les images, on arrete le temps*/
function pause()
{
	$("#pause").hide();
	$("#continuer").show();
	var $imgs= $( "#tableau img" );
		
	$imgs.each(function(){
			
	$(this).off();
		});	
  clearInterval(chrono);
}

/* cette fonction est associee a levenment du bouton continuer elle reaffiche le bouton,*/
function continuer()
{	
	$("#continuer").hide();
	$("#pause").show();
	var $imageTournees= $("#tableau img[src='images/img0.jpg']");		
	$imageTournees.each(function(){			
	$(this).one("click", {laCarte:this}, retourner);
		});	
	chrono= setInterval(function(){temps();},1000);
}

/* retourne une image aleatoire d'un tableau et l enleve de la liste*/
function randomImages(imgTab) 
{
	var rand = Math.floor(Math.random()*imgTab.length);
	var imd = imgTab[rand];
	imgTab.splice(rand,1);
		
	return imd;
}
/* je retourne l'image cacher, j l ajoute a mon tableau d images paires et j invoque la fonction qui teste si les 2 element sont paires ou non*/
function retourner(event)
{	
	var image = event.data.laCarte;
	$(image).attr("src", $(image).data("imgCache")); 
	paireTab.push(image); 
	testerPaire();	
}

/* on suppose que toutes les images sont affiches puis on commence a compter les images qui cachent, 
lorsque les images qui cachent sera =0 on gagner le jeu */
function testerPaire()
{	
	var compteur=0;	
	if (paireTab.length==2) // si on cliquer 2 fois on aura 2 images
	{
		var img1= paireTab[0];
		var img2= paireTab[1];
		
		if (img1.src!=img2.src)//images differentes
		{
			setTimeout(function() {hide($(img1),$(img2));},500);
			$(img1).one("click", {laCarte:img1}, retourner); // recursivite a ce niveau 
			$(img2).one("click", {laCarte:img2}, retourner);
		}
		else // images egales on compte combien d images qui cachent restent
		{
			
			var $imgs= $( "#tableau img" );	
			$imgs.each(function(){
				if ($(this).attr("src")=="images/img0.jpg")
				{
					compteur++;
				}
			});
			$("#score").val(score+=(30+bonus)); // ajoute le bonus des paires trouvees
			if (compteur==0)  // si il restent plus d images qui cachent le jeu est fini
			{
				$("#scoreAf").text(score);
				$("#tempsAf").text(seconde);
				$(".modal").modal("show");
				
				clearInterval(chrono);
				$("#continuer").hide();
				$("#pause").hide();
				$("#quitter").hide();
				if (score>meilleurScore) // on enregistre le meilleur score
				{	
					meilleurScore=score;
					localStorage.setItem("meilleurScore",meilleurScore);
					$("#BestScore").val(meilleurScore);
				}
				if (meilleurTemps==null)  // resolution d affichage du meilleure score la premiere fois
				{
					meilleurTemps = seconde+1;
				}
				if (seconde< meilleurTemps) // on enregistre le meilleur temps
				{
					meilleurTemps=seconde;
					localStorage.setItem("meilleurTemps",meilleurTemps);
					$("#MeilleurTemps").val(meilleurTemps);
				}
			}		
		}
		paireTab = new Array(); // on le revide pour tester de nouveau	
	}	
}

/* je l utilise afin de cacher deux images differentes , je leurs donnent l image qui cache*/
function hide(img1, img2) 
{
	img1.attr("src","images/img0.jpg");
	img2.attr ("src","images/img0.jpg");
}

/* je l utilise pour afficher l increment de seconde dans la fonction interval */
function temps()
{
	$("#temps").val(++seconde);
	if (seconde==10)
	{bonus=200;}
	else if (seconde==20)
	{bonus=100;}
	else if (seconde==30)
	{bonus=50;}
	else if (seconde==40)
	{bonus=0;}	
}

/* je l utilise pour afficher l element actif lorsque la souris est dessus */
function navig()
{
	$("a").click(function(){
		e.preventDefault();
		$(this).parent().addClass("active");	
		$(this).parent().nextAll().removeClass("active");
		$(this).parent().prevAll().removeClass("active");
	});	
}