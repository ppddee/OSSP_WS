var selections = new Array(); 
	selections['X'] = new Array();
	selections['Y'] = new Array();

var scores = new Array(); 
	scores['X'] = 0;
	scores['Y'] = 0;

var turn = 'X';
var game_type = 3;
var total_turns = 0;
var robot = true;
var finished = false;

// 게임 재시작
function resetParams() {
	turn = 'X';
	game_type = 3;
	total_turns = 0;
	robot = true;
	finished = false;

	selections['X'] = new Array();
	selections['Y'] = new Array();
}

// 승자 패턴
function winnerPatterns() {
	var wins = Array();

	// 3 x 3
	if (game_type==3) wins = [  [11,12,13], [21,22,23], [31,32,33],
						 		[11,21,31], [12,22,32], [13,23,33], 
						 		[11,22,33], [13,22,31] ];

	// 4 x 4
	if (game_type==4) wins = [  [11,12,13,14], [21,22,23,24], [31,32,33,34], [41,42,43,44],
						 		[11,21,31,41], [12,22,32,42], [13,23,33,43], [14,24,34,44],
						 		[14,23,32,41], [11,22,33,44] ];

	// 5 x 5
	if (game_type==5) wins = [  [11,12,13,14,15], [21,22,23,24,25], [31,32,33,34,35], [41,42,43,44,45], [51,52,53,54,55],
						 		[11,21,31,41,51], [12,22,32,42,52], [13,23,33,43,53], [14,24,34,44,54], [15,25,35,45,55],
						 		[11,22,33,44,55], [15,24,33,42,51] ];

	return wins
}


// AI 패턴 배열
function AiPatterns() {
	var ai_turns = Array();

	// 3 x 3
	if (game_type==3) ai_turns = [22,11,33,13,21,23,12,32,31];

	// 4 x 4
	if (game_type==4) ai_turns = [11,22,33,44,14,13,12,21,31,41,42,43,24,34,32,23];

	// 5 x 5
	if (game_type==5) ai_turns = [11,22,33,44,55,15,14,13,12,51,41,31,21,35,45,25,53,52,54,42,43,32,34,23,24];

	return ai_turns
}


// 승자 확인
function checkWinner() {
	var selected = selections[turn].sort();
	var win_patterns = winnerPatterns();

	finished = false;
	for (var x=0; x < win_patterns.length; x++) {
		if (finished != true) { 
			finished = isWinner(win_patterns[x], selections[turn]);

			if ( finished === true ) {
				scoreUpdate(turn);  // 기록 업데이트
				disableAll();  // 비활성화
				alert('Player '+ turn +' Win');   // 팝업 창으로 승자 알려주기
				break;
			} 
		}
	}

	// 무승부
	if ( ( total_turns == (game_type*game_type) ) && finished === false ) { 
		alert("It's a tie");
		finished = true;
		disableAll(); 
	}
}


// 승리 패턴 사용
function isWinner(win_pattern, selections){
	var match = 0;
	for (var x=0; x<win_pattern.length; x++) {
		for (var y=0; y<selections.length; y++) {
			if (win_pattern[x]==selections[y]) {
				match++;
			}
		}
	}
	if (match==win_pattern.length) return true;

	return false;
}

// 게임이 끝난 후 비활성
function disableAll() {
	var elements = document.getElementsByClassName("grid-box");
	for (var i = 0; i < elements.length; i++) {
	  elements[i].disabled =true;
	}

}

// 재시작할 때 AI 모드 활성화
function resetAIButton() {
	var checkbox = document.getElementById('robot'); 	
	checkbox.checked = 'checked';
}

// 새 게임 
function newGame(){
	resetParams();  // 모든 파라미터 재설정
	game_type = Number(document.getElementById('game_type').value);

	robot_object = document.getElementById('robot');    // Ai 선택하면 그걸로 아니면 둘이서
	if (robot_object.checked === true) robot = true; 
	else  robot = false;

	document.getElementById('game-board').innerHTML = '';

	// 생성
	for (var row = 1; row <= game_type; row++){
		for (var col = 1; col <= game_type; col++) {
			var unique_name = 'grid-' + row+'-' + col;
			var unique_id = row+''+col;
			var button = document.createElement("input");

			button.setAttribute("value", ' ');
			button.setAttribute("id", unique_id);
			button.setAttribute("name", unique_name);
			button.setAttribute("class", 'grid-box');
			button.setAttribute("type", 'button');
			button.setAttribute("onclick", "markCheck(this)");
			document.getElementById('game-board').appendChild(button);
		}

		var breakline = document.createElement("br");
			document.getElementById('game-board').appendChild(breakline);
	}

}

// 공수 전환
function changeTurn(){
	if (turn == 'X') turn = 'Y';
	else turn = 'X';
}

function markCheck(obj){
	obj.value = turn;
	total_turns++;

	if (turn == 'X' ) {
		obj.setAttribute("class", 'green-player');
	} else {
		obj.setAttribute("class", 'red-player');
	}

	obj.setAttribute("disabled", 'disabled');
	selections[turn].push(Number(obj.id));

	checkWinner();
	changeTurn();

	if (robot===true) autoTurn(); // 로봇은 후자
}

function autoTurn(again=false) {

	is_empty_result = true;
	if (turn === 'X' || finished === true) return false;

	var robot_pattern = '';
	if (again==true) robot_pattern = AiPatterns();
	else robot_pattern = getAutoTurnPattern(); 

	for(var x = 0; x < robot_pattern.length; x++) {
		var desired_obj = document.getElementById(robot_pattern[x]);
		if (desired_obj.value == '' || desired_obj.value == ' ') { 
			markCheck(desired_obj); 
			is_empty_result = false;
			break;
		} 
	}

}

function getAutoTurnPattern() {
	var pattern = [];
	pattern = getMostNearestPattern('Y');
	if (pattern.length <= 0) {
		pattern = getMostNearestPattern('X');
		if (pattern.length <= 0) {
			pattern = AiPatterns();
		}
	}
	return pattern;
}

// 패턴 가져오기
function getMostNearestPattern(turn){
	var matches = 0;
	var selected = selections[turn].sort();
	var win_patterns = winnerPatterns();

	finished = false;
	for (var x=0; x < win_patterns.length; x++) {
		var intersected = intersectionArray(selected, win_patterns[x]);
		if ( intersected.length==(win_patterns[x].length-1) ) { // win_patterns[x]
			for (var y=0; y < win_patterns[x].length; y++) {
				obj = document.getElementById(win_patterns[x][y]);
				if (obj.value == '' || obj.value == ' ') {  // 비었을 경우
					return win_patterns[x];	
				}
			}
		}

	}
	return [];
}

function intersectionArray(x, y){
    var response = [];
    for (var i = 0; i < x.length; i++) {
        for (var z = 0; z < y.length; z++) {
            if (x[i] == y[z]) {
                response.push(x[i]);
                break;
            }
        }
    }
    return response;
}

// 팝업 창 생기도록 설정
function scoreUpdate(turn){
	scores[turn]++;
	document.getElementById('score-'+turn).innerHTML = scores[turn];
}