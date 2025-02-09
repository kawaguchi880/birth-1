document.addEventListener("DOMContentLoaded", function () {
    function isMobileDevice() {
        console.log(navigator.userAgent);
        return /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent) || window.innerWidth < 800;
    }

    if (isMobileDevice()) {
        // スマホならモーダルを表示し、ポップアップは作らない
        const modal = document.createElement("div");
        modal.id = "errorModal";
        modal.innerHTML = `
            <div class="modal-content">
                <h2>⚠ エラー ⚠</h2>
                <p>PC ONLYと書いただろうが</p>
                <p>( ` + "`・_・｀`" + ` )</p>
                <p>そも、PC持っているのか？</p>
                <button id="modalYesBtn">はい</button>
                <button id="modalNoBtn">いいえ</button>
            </div>
        `;
        document.body.appendChild(modal);

        // 「はい」ボタン（モーダル）：無限ループ
        document.getElementById("modalYesBtn").addEventListener("click", function () {
            alert("はい、ではPCで開いてください。");
            setTimeout(() => {
                location.reload(); // ページをリロードして無限ループ
            }, 1000);
        });

        // 「いいえ」ボタン（モーダル）：PC販売ページへ飛ばす
        document.getElementById("modalNoBtn").addEventListener("click", function () {
            alert("ならPCを買え！！！\nアマゾンでいいぞ！！！");
            setTimeout(() => {
                window.location.href = "https://www.amazon.co.jp/s?k=とても高いPC"; // AmazonのPC販売ページに飛ばす
            }, 1000);
        });

    } else {
        showGiftPopup();
    }
});

// 🎁 プレゼントポップアップを表示
function showGiftPopup(isNoBtn = true) {
    const popup = document.createElement("div");
    popup.id = "popup";
    popup.innerHTML = `
        <div class="popup-content">
            <div class="gift-popup-header">伊藤様へ</div>
            <h2>🎁 プレゼントが届いた！</h2>
            <p>受け取りますか？</p>
            <div class="popup-buttons">
                <button class="popup-btn" id="popupYesBtn">はい</button>
                ${isNoBtn ? '<button id="popupNoBtn">いいえ</button>' : ''}
            </div>

            <div class="gift-popup-footer">川口より</div>
        </div>
    `;
    document.body.appendChild(popup);

    // 「はい」ボタン：プレゼント開封準備
    document.getElementById("popupYesBtn").addEventListener("click", function () {
        displayPopup(jumpText("🎊 プレゼント開封準備中… 🎊"), null, false);
        setTimeout(() => {
            let existingPopup = document.getElementById("popup");
            if (existingPopup) {
                existingPopup.remove();
            }
            startGiftOpening(); // HP制システムで開封
        }, 6000);
    });

    // 「いいえ」ボタン：煽るポップアップへ
    document.getElementById("popupNoBtn").addEventListener("click", function () {
        displayPopup("え？受け取らないの？？<br>せっかくのプレゼントなのに…😢", () => {
            displayPopup("そうだね。<br>よく分らないプレゼントは怪しさ満点だからね。", () => {
                showNextStep();
            });
        });
    });
}

let incorrectCounts = JSON.parse(localStorage.getItem("incorrectCounts")) || {};
function updateIncorrectCount(questionKey) {
    incorrectCounts[questionKey] = (incorrectCounts[questionKey] || 0) + 1;
    localStorage.setItem("incorrectCounts", JSON.stringify(incorrectCounts)); // 🔥 保存
}
function getIncorrectCount(questionKey) {
    return incorrectCounts[questionKey] || 0;
}
// 📢 ポップアップを表示する関数
function displayPopup(message, callback = null, choiceBtn = true, imageName = null) {
    let existingPopup = document.getElementById("popup");
    if (existingPopup) {
        existingPopup.remove();
    }

    const popup = document.createElement("div");
    popup.id = "popup";
    let imageElement = imageName ? `<div class="popup-image-container"><img src="./assets/${imageName}_ans.png" class="popup-image" alt="正解画像"></div>` : "";

    popup.innerHTML = `
        <div class="popup-content">
            <p>${message}</p>
            ${imageElement}
            ${choiceBtn ? '<div class="popup-buttons"><button id="closePopupBtn">OK</button></div>' : ''}
        </div>
    `;
    document.body.appendChild(popup);

    // 「OK」ボタンがある場合のみ、クリック時の処理を追加
    if (choiceBtn) {
        document.getElementById("closePopupBtn").addEventListener("click", function () {
            popup.remove();
            if (callback) callback(); // コールバック関数があれば実行
        });
    }
}



// 🎥 動画を再生する関数（音量設定付き）
function playVideo(completeQuestion = false) {
    let videoWrapper = document.createElement("div");
    videoWrapper.id = "videoWrapper";
    let videoSrc = "./assets/dsoul.mp4";
    videoWrapper.innerHTML = `
        <video id="playbackVideo" width="80%" autoplay muted>
            <source src="${videoSrc}" type="video/mp4">
            お使いのブラウザは動画をサポートしていません。
        </video>
    `;
    document.body.appendChild(videoWrapper);

    let video = document.getElementById("playbackVideo");

    video.onended = function () {
        let retryCount = incrementRetryCount() * 100;

        if (completeQuestion) {
            if (videoWrapper) {
                videoWrapper.remove();
            }
            if (document.getElementById("giftWrapper")) {
                document.getElementById("giftWrapper").remove();
            }
            displayPopup(`再戦！（弱い値: ${retryCount})`, () => {
                startSecondGiftBox();
            });
        } else {
            displayPopup(`やり直す（弱い値: ${retryCount})`, () => {
                location.reload(); // 画面をリロード
            });
        }
    };
}

function startGiftOpening(box_gold = false) {
    let hp = 10; // HPの初期値
    let damage = 1; // 1クリックごとの減少量

    let giftWrapper = document.createElement("div");
    giftWrapper.id = "giftWrapper";
    giftWrapper.innerHTML = `
        <div class="gift-container">
            <p class="gift-hp">HP: <span id="giftHp">${hp}</span></p>
            <img id="giftImage" src="./assets/box_white.png" alt="プレゼントボックス">
        </div>
    `;
    document.body.appendChild(giftWrapper);

    let giftImage = document.getElementById("giftImage");
    let giftHpText = document.getElementById("giftHp");

    // クリック時の処理
    giftImage.addEventListener("click", function () {
        if (hp > 0) {
            hp -= damage;
            giftHpText.textContent = hp;

            // 🎥 クリックでボックスが揺れる＆ひび割れアニメーション
            giftImage.classList.add("shake");
            setTimeout(() => {
                giftImage.classList.remove("shake");
            }, 150);

            // 💥 HPが減るごとに壊れ具合を演出
            let brokenLevel = Math.floor((10 - hp) / 3); // クリック回数に応じてクラス変更
            giftImage.style.filter = `brightness(${100 - brokenLevel * 15}%) contrast(${100 + brokenLevel * 10}%)`;

            // HPが0になったら開封
            if (hp <= 0 && box_gold) {
                setTimeout(() => {
                    document.body.removeChild(giftWrapper);
                    displayPopup("💨 煙の中から何かが…", () => {
                        startSecondGiftBox(); // 次のボックス登場！
                    });
                }, 500);
            }
            else if (hp <= 0) {
                setTimeout(() => {
                    document.body.removeChild(giftWrapper);
                    displayPopup("🎁 おめでとう！勢いよく白い煙があなたに噴出した", () => {
                        playVideo();
                    });
                }, 500);
            }
        }
    });
}


function jumpText(text) {
    return Array.from(text) // 🎊 などの絵文字をバラバラにしない
        .map((char, i) => `<span class="jump" style="animation-delay: ${i * 0.4}s">${char}</span>`)
        .join(""); // 文字を再び結合
}

// 🎯 ローカルストレージでやり直し回数を管理
function getRetryCount() {
    return parseInt(localStorage.getItem("retryCount")) || 0;
}

function incrementRetryCount() {
    let count = getRetryCount() + 1;
    localStorage.setItem("retryCount", count);
    return count;
}
// ここコード汚すぎて草ww
function showNextStep() {
    displayPopup("じゃあクイズに正解したら<br>プレゼントをあげよう", () => {
        showQuizPopup("日本で一番高い山は？", "choice", ["富士山", "北岳", "剣岳", "阿蘇山"], "富士山", "mountain",
            () => {
                displayPopup("さすがに余裕かな？", () => {
                    showQuizPopup("アニメ『花咲くいろは』に出てくる<br>「ホビロン」は、<br>「ほんとに びっくりするほど 何？」", "text", [], "論外", "hobiron",
                        () => {
                            displayPopup("これちょっと怪しかったんやないか？", () => {
                                showQuizPopup("だーれだ？", "picture", [], "中村悠真", "yuma",
                                    () => {
                                        displayPopup("足湯入った時の写真やな。足のフォルム綺麗すぎる<br>バレリーナかよ", () => {
                                            showQuizPopup("この特徴的なポーズの後ろには何がある？", "picture_choice", ["椅子", "公園", "鳥居", "海"], "椅子", "taku1",
                                                () => {
                                                    displayPopup("この後、くっそ並んだ後に食べた牛丼は<br>まじでうまかったな", () => {
                                                        showQuizPopup("後ろにあるものはなに？", "picture_choice", ["空", "福岡タワー", "鳥居", "竹林"], "竹林", "haru1",
                                                            () => {
                                                                displayPopup("正直、撮り方うまいなと思った。<br>早くもこの時期に戻りたいnou。", () => {
                                                                    showQuizPopup("この日の夜に食ったものは？", "picture_choice", ["三日前のカレー", "玉ねぎ", "肉", "親のスネ"], "肉", "end",
                                                                        () => {
                                                                            displayPopup("グランピング初心者すぎて<br>玉ねぎすら焼けなかった模様<br>(包丁ないとか知らんやん(´pωq｀))<br>肉はうまかった。あれでいいんや", () => {
                                                                                showlastStep();
                                                                            }, true, "end");
                                                                        }, "end");
                                                                }, true, "haru1");
                                                            }, "haru1");
                                                    }, true, "taku1");
                                                }, "taku1");
                                        }, true, "yuma");
                                    }, "yuma");
                            });
                        }
                    );
                }
                );
            }
        );
    });
}
function showlastStep() {
    displayPopup("やっとクイズ終わったんか<br>おそくないですかねェ~", () => {
        displayPopup("案外色々行っとったんやな、旅行。<br>結局、今印象にあるのグランピングかねえ<br>まあ、写真立て効果かな", () => {
            displayPopup("ここまで付き合ってくれてありがとう♪<br>тнайк чoμ_〆(・ω・* )", () => {
                displayPopup("誕生日のプレゼントではないが、、<br>まあたまにはこうゆうのもいいでしょう。<br>多分、これする人あんまいないだろうし、、", () => {
                    displayPopup("改めて誕生日おめでと~<br>(*°ｪ°ﾉﾉﾞ☆パチパチパチパチ", () => {
                        displayPopup("以上です。火急的速やかにブラウザを閉じてください。<br>なお、個人的な画像も含まれているので<br>明日には非公開にします", () => {
                            displayPopup("「人は思い出を忘れることで生きてゆける。<br>だが決して忘れてはならないこともある」<br>碇ゲンドウ", () => {
                                displayPopup("さようなら", () => {
                                    displayPopup("さようならって言ったでしょ", () => {
                                        displayPopup("可及的速やかに(・∀・)カエレ!!", () => {
                                            displayPopup("可及的速やかに(・∀・)カエレ!!", () => {
                                                displayPopup("可及的速やかに(・∀・)カエレ!!", () => {
                                                    displayPopup("何？まだ何かあると思ってるわけ？？<br>あるわけねーじゃん", () => {
                                                        displayPopup("このセリフ打つのも鬱なの(-＿-)", () => {
                                                            displayPopup("いいでしょう！！<br>しつこすぎるあなたには・・・", () => {
                                                                displayPopup("些細ですが、これをあげましょう", () => {
                                                                    displayPopup("はい、どうぞ？", () => {
                                                                        displayPopup(jumpText("🎊 プレゼント開封準備中… 🎊"), null, false);
                                                                        setTimeout(() => {
                                                                            let existingPopup = document.getElementById("popup");
                                                                            if (existingPopup) {
                                                                                existingPopup.remove();
                                                                            }
                                                                            startGiftOpening(true); // HP制システムで開封
                                                                        }, 6000);
                                                                    });
                                                                });
                                                            });
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
}

function showQuizPopup(question, type, options = [], correctAnswer, questionKey, callback, imageName = null) {
    let existingPopup = document.getElementById("popup");
    if (existingPopup) {
        existingPopup.remove();
    }

    let startTime = Date.now();

    const popup = document.createElement("div");
    popup.id = "popup";
    let inputField = "";

    // 🔹 選択肢タイプ（ラジオボタン）
    if (type === "choice" && options.length > 0) {
        inputField = `
            <div class="quiz-options">
                ${options.map((option, i) => `
                    <label class="quiz-option" data-value="${option}">
                        <input type="radio" name="quizOption" value="${option}"> ${option}
                    </label>
                `).join("")}
            </div>
        `;
    }
    // 🔹 数値入力タイプ（input[type=number]）
    else if (type === "number") {
        inputField = `<input type="number" id="quizInput" placeholder="数値を入力">`;
    }
    // 🔹 文字列入力タイプ（input[type=text]）
    else if (type === "text") {
        inputField = `<input type="text" id="quizInput" placeholder="答えを入力">`;
    }
    else if (type === "picture" && imageName) {
        inputField = `
            <div class="quiz-image-container">
                <img src="./assets/${imageName}_ques.png" class="quiz-image" alt="誰の写真？">
            </div>
            <input type="text" id="quizInput" placeholder="フルネームを入力">
        `;
    } else if (type === "picture_choice" && options.length > 0) {
        inputField = `
        <div class="quiz-image-container">
            <img src="./assets/${imageName}_ques.png" class="quiz-image" alt="誰の写真？">
        </div>
        <br>
        <div class="quiz-options">
            ${options.map((option, i) => `
                <label class="quiz-option" data-value="${option}">
                    <input type="radio" name="quizOption" value="${option}"> ${option}
                </label>
            `).join("")}
        </div>
    `;
    }
    let hint = getIncorrectCount(questionKey) >= 2 ? `<p class="hint-text">${getHint(questionKey)}</p>` : "";

    popup.innerHTML = `
        <div class="popup-content">
            <h3>❓ クイズ ❓</h3>
            <p>${question}</p>
            <div class="quiz-input">${inputField}</div>
            ${hint ? hint : ""}
            <div class="popup-buttons">
                <button class="popup-button"  id="submitQuiz">回答</button>
            </div>
        </div>
    `;

    document.body.appendChild(popup);

    document.querySelectorAll(".quiz-option").forEach(option => {
        option.addEventListener("click", function () {
            document.querySelectorAll(".quiz-option").forEach(opt => opt.classList.remove("selected"));
            this.classList.add("selected");
            this.querySelector("input").checked = true;
        });
    });


    document.getElementById("submitQuiz").addEventListener("click", function () {
        let endTime = Date.now();
        let elapsedTime = (endTime - startTime) / 1000;
        let selectedOption = document.querySelector("input[name='quizOption']:checked");
        let userAnswer = selectedOption ? selectedOption.value : "";
        if (type === "choice" || type === "picture_choice") {
            let selectedOption = document.querySelector("input[name='quizOption']:checked");
            userAnswer = selectedOption ? selectedOption.value : "";
        } else {
            userAnswer = document.getElementById("quizInput").value.trim();
        }

        if (userAnswer === correctAnswer) {
            if (elapsedTime <= 30) {
                displayPopup("🎉 正解だねえ~(ﾉД｀)", callback);
            } else {
                displayPopup("正解だけど、時間かかりすぎじゃない？<br>調べてんじゃないでしょうね？", callback);
            }
        } else {
            updateIncorrectCount(questionKey);
            if (getIncorrectCount(questionKey) > 2) {
                displayPopup(`間違いすぎや<br>${getHint(questionKey)}`, () => {
                    playVideo();
                });
            }
            else {
                displayPopup("まあ、正直、不正解なんてありえないよね。。", () => {
                    playVideo();
                });
            }
        }
    });
}

function getHint(questionKey) {
    const hints = {
        mountain: "ヒントいらんやろ",
        hobiron: "ヒント：漢字2文字や。「!」はいらんで",
        yuma: "ヒント：旅行での足湯の写真やで",
        taku1: "ヒント：学校で使ったな。この後、牛丼食った。",
        haru1: "ヒント：京都での写真やで",
        end: "ヒント：グランピングでの写真やで"
    };

    return hints[questionKey] || "ヒントなし";
}

function startSecondGiftBox() {
    let giftWrapper = document.createElement("div");
    giftWrapper.id = "giftWrapper";
    giftWrapper.innerHTML = `
        <div class="last-gift-container">
            <p>本物のボックスが現れた…</p>
            <p>なんだが、こちらを睨んでいるようだ</p>
            <img id="giftImage" src="./assets/box_gold_0.png" alt="本物のプレゼントボックス">
            <p><button class ="popup-button" id="finalBattleBtn">💥 開封開始！</button></p>
        </div>
    `;
    document.body.appendChild(giftWrapper);

    document.getElementById("finalBattleBtn").addEventListener("click", function () {
        document.body.removeChild(giftWrapper);
        startTrueGiftOpening(); // 🎮 ボス戦突入！
    });
}

function startTrueGiftOpening() {
    let isDefeated = false;
    let playerHP = 100;
    let boxHP = 100;
    let attackTiming = 0;
    let attackDirection = 1;

    const giftWrapper = document.createElement("div");
    giftWrapper.id = "giftWrapper";
    giftWrapper.innerHTML = `
        <div class="battle-container">
            <!-- 🎁 ボックスHP（右上） -->
            <div class="box-hp-container">
                <p>🎁 ボックス</p>
                <div class="hp-bar">
                    <div id="boxHpBar" class="hp-fill no-animation" style="width: 0%;"></div>
                </div>
                <p><span id="boxHp">${boxHP}</span>/100</p>
            </div>

            <!-- 🎁 プレゼントボックス -->
            <img id="lastGiftImage" src="./assets/box_gold_0.png" alt="プレゼントボックス">

            <!-- ⚔ 攻撃タイミング -->
            <div class="timing-container">
                <p id ="guideMessage"></p>
                <div class="timing-bar">
                    <div class="critical-zone"></div>
                    <div class="damage-zone"></div>
                    <div id="timingPointer"></div>
                </div>
                <button id="attackBtn" disabled><div class="cooldown-bar"></div>⚔ 攻撃！</button>

            </div>

            <!-- 🧍 プレイヤーHP（左下） -->
            <div class="player-hp-container">
                <p>🧍 プレイヤー</p>
                <div class="hp-bar">
                    <div id="playerHpBar" class="hp-fill no-animation" style="width: 0%;"></div>
                </div>
                <p><span id="playerHp">${playerHP}</span>/100</p>
            </div>
        </div>
    `;
    document.body.appendChild(giftWrapper);

    const attackBtn = document.getElementById("attackBtn");

    // 🎬 戦闘開始アニメーション
    function startBattleAnimation() {
        let guideMessage = document.getElementById("guideMessage");
        guideMessage.textContent = "タイミングよく攻撃する！";
        guideMessage.style.opacity = "1";

        setTimeout(() => {
            document.getElementById("boxHpBar").classList.remove("no-animation");
            document.getElementById("playerHpBar").classList.remove("no-animation");
            document.getElementById("boxHpBar").style.width = "100%";
            document.getElementById("playerHpBar").style.width = "100%";
        }, 500);

        // 2秒後に戦闘開始
        setTimeout(() => {
            attackBtn.disabled = false;
            moveAttackBar();
            startBoxAttack();
            guideMessage.style.transition = "opacity 1s ease-out"; // フェードアウト効果
            guideMessage.style.opacity = "0";
        }, 2500);
    }

    // 🎯 攻撃タイミングバーを動かす
    function moveAttackBar() {
        attackTiming += attackDirection * 2;
        if (attackTiming >= 100 || attackTiming <= 0) {
            attackDirection *= -1; // 方向を逆にする
        }
        let pointer = document.getElementById("timingPointer");
        let adjustedTiming = attackTiming + attackDirection * 20
        pointer.style.left = adjustedTiming + "%";
        setTimeout(moveAttackBar, 20);
    }

    // 🎯 プレイヤーの攻撃
    attackBtn.addEventListener("click", function () {
        if (this.disabled) return;

        startCooldown(2000);

        let damage = 0;
        let effectText = "";

        if (attackTiming > 48 && attackTiming < 52) {
            // 💥 クリティカルヒット
            damage = Math.floor(Math.random() * 8) + 10; // 10〜17ダメージ
            effectText = `${damage}`;
        } else if (attackTiming > 35 && attackTiming < 65) {
            // ⚔ 通常ヒット
            damage = Math.floor(Math.random() * 6) + 4; // 4〜9ダメージ
            effectText = `${damage}`;
        } else {
            // ❌ ミス
            effectText = "MISS!";
            damage = 0;
        }
        showDamageEffect("box", effectText, damage);

        if (damage > 0) {
            boxHP -= damage;
            if (boxHP < 0) boxHP = 0;
            document.getElementById("boxHp").textContent = boxHP;
            document.getElementById("boxHpBar").style.width = (boxHP / 100) * 100 + "%";
        }

        if (boxHP <= 0 && !isDefeated) {
            displayPopup("🎉 ボックスを倒した！プレゼント開封や！！", () => {
                displayPopup("じゃじゃーん！！", () => {
                    displayPopup("なんてね...", () => {
                        displayPopup("プレゼント渡すとおもた？<br>いやいや、ちょっと事情があってな。<br>厳しいねんて。。", () => {
                            displayPopup("ここで、渡すのはセキュリティー的問題があるんや<br>( ´・_・｀ )<br>ポチ袋のパスコード出すから堪忍な", () => {
                                displayPopup("パスコード：8467", () => {
                                    displayPopup("以上！終わり！<br>Thank you for Playing<br>この後、音量注意！！", () => {
                                        startEndingSequence();
                                    });
                                });
                            });
                        });
                    });
                });
            });
        }else if (boxHP <= 0) {
            displayPopup("🎉 ボックスを倒した！プレゼント開封や！！", () => {
                displayPopup("😈 おや？ 君はすでに敗北しているはずでは？", () => {
                    displayPopup("📜 ズルをしたな？<br>公平なバトルをする気がないとは…<br>いや、これはまあ、バグみたいなものか。", () => {
                        displayPopup("🚪 すまないが、これではプレゼントを<br>渡すわけにはいかんな。", () => {
                            displayPopup("🌫️ プレゼントは闇に消えた…", () => {
                                playVideo(true);
                            });
                        });
                    });
                });
            });
        }
    });

    // 💀 ボックスの攻撃（3秒ごと）
    function startBoxAttack() {
        function boxAttack() {
            if (boxHP > 0) {
                let giftImage = document.getElementById("lastGiftImage");
                giftImage.classList.add("shake");
                giftImage.style.filter = "brightness(1.5) contrast(1.2)";
                setTimeout(() => {
                    giftImage.style.filter = "none";
                }, 200);
                let damage = Math.floor(Math.random() * 10) + 5;
                let playerHP = parseInt(document.getElementById("playerHp").textContent);
                playerHP -= damage;
                if (playerHP < 0) playerHP = 0;
                document.getElementById("playerHp").textContent = playerHP;
                document.getElementById("playerHpBar").style.width = (playerHP / 100) * 100 + "%";

                // 💥 ダメージエフェクト
                showDamageEffect("player", `-${damage}`, damage);

                triggerScreenDamageEffect(playerHP);

                setTimeout(() => {
                    giftImage.classList.remove("shake");
                }, 300);

                if (playerHP <= 0) {
                    isDefeated = true;
                    displayPopup("💀 君は敗北した…プレゼントは闇に消えた…", () => {
                        playVideo(true);
                    });
                } else {
                    setTimeout(boxAttack, 3000);
                }
            }
        }

        setTimeout(boxAttack, 3000);
    }

    startBattleAnimation();
}

// 💥 ダメージエフェクト関数
function showDamageEffect(target, damageText, damageValue) {
    const targetElement = target === "box" ? document.getElementById("lastGiftImage") : document.getElementById("playerHpBar");

    const effect = document.createElement("div");
    effect.classList.add("damage-effect");

    // ダメージの大きさによってスタイルを変更
    let color = "white";
    let fontSize = "24px";
    let animationType = "damageFade";

    if (damageValue >= 10) {
        color = "orange";
        fontSize = "40px";
        animationType = "criticalHit";
    }else if (damageValue > 0) {
        color = "white";
        fontSize = "24px";
    } else if (damageValue == 0) {
        color = "blue";
        fontSize = "24px";
        animationType = "missEffect";
    }

    effect.style.color = color;
    effect.style.fontSize = fontSize;
    effect.innerHTML = damageText;
    effect.classList.add(animationType);

    // ダメージエフェクトをターゲットに追加
    targetElement.parentElement.appendChild(effect);


    // 1秒後にエフェクトを削除
    setTimeout(() => {
        effect.remove();
    }, 800);
}

function startCooldown(duration) {
    let attackBtn = document.getElementById("attackBtn");
    let cooldownBar = attackBtn.querySelector(".cooldown-bar");

    attackBtn.disabled = true;
    attackBtn.style.opacity = "0.5";
    attackBtn.style.color = "gray"; // クールダウン中はグレー

    cooldownBar.style.transition = "none";
    cooldownBar.style.width = "0%";

    setTimeout(() => {
        cooldownBar.style.transition = `width ${duration}ms linear`;
        cooldownBar.style.width = "100%";
    }, 50);

    setTimeout(() => {
        attackBtn.disabled = false; 
        attackBtn.style.opacity = "1";
        cooldownBar.style.color = "white";
        cooldownBar.style.transition = "none";
        cooldownBar.style.width = "0%";
    }, duration);
}

function triggerScreenDamageEffect(playerHP) {
    let screenEffect = document.getElementById("screenEffect");
    if (playerHP <= 10) {
        screenEffect.classList.add("low-hp");
    } else {
        screenEffect.classList.remove("low-hp");
        screenEffect.classList.add("damage-flash");

        setTimeout(() => {
            screenEffect.classList.remove("damage-flash");
        }, 500);
    }
}

function startEndingSequence() {
    if (document.getElementById("popup")) {
        document.getElementById("popup").remove();
    }
    if (document.getElementById("giftWrapper")) {
        document.getElementById("giftWrapper").remove();
    }
    // 🎥 背景BGMの再生
    let audio = new Audio("./assets/endroll_bgm.wav");
    audio.loop = true;
    audio.volume = 0.2;
    audio.play();

    let retryCount = incrementRetryCount();
    let weakValue = retryCount * 100;

    // 📸 写真スライドショー
    const photoWrapper = document.createElement("div");
    photoWrapper.id = "photoWrapper";
    document.body.appendChild(photoWrapper);

    const photoList = Array.from({ length: 15 }, (_, i) => `./assets/${i + 1}.jpg`);
    let currentPhotoIndex = 0;

    function showNextPhoto() {
        let photoFrame = document.createElement("div");
        photoFrame.classList.add("photo-frame");
    
        let photo = document.createElement("img");
        photo.src = photoList[currentPhotoIndex];
        photo.classList.add("photo-image");
    
        // 画像を額縁の中に追加
        photoFrame.appendChild(photo);
        photoWrapper.innerHTML = ""; // 前の写真を削除
        photoWrapper.appendChild(photoFrame);
    
        // 次の写真へ（ループ）
        currentPhotoIndex = (currentPhotoIndex + 1) % photoList.length;
        
        setTimeout(showNextPhoto, 10000);
    }
    showNextPhoto();

    // 🎞 エンドロール
    let creditsWrapper = document.createElement("div");
    creditsWrapper.id = "creditsWrapper";
    creditsWrapper.innerHTML = `
        <div id="credits">
            <p>🎬 Special Thanks</p>
            <p>A Journey Through Time & Memories<p>
            <br><br><br><br><br><br><br>
            <p>🎮 Game Director: 川口 遥生</p>
            <br><br><br><br><br><br><br>
            <p>🖥️ Website Creator: 川口 遥生</p>
            <br><br><br><br><br><br><br>
            <p>🎨 UI Designer: 川口 遥生 の 直感</p>
            <br><br><br><br><br><br><br>
            <p>📜 Story: そんなもんなかった。</p>
            <br><br><br><br><br><br><br>
            <p>🎨 Art: Lineアルバムから頂戴しました。</p>
            <br><br><br><br><br><br><br>
            <p>🎵 Music: 【フリーBGM】ちょっと哀愁漂うギター</p>
            <p>ニコニ・コモンズ Ozzz(おず)さんより</p>
            <p>https://commons.nicovideo.jp/works/nc396921</p>
            <br><br><br><br><br><br><br>
            <p>💻 Programming: HTML CSS JS のみ</p>
            <br><br><br><br><br><br><br>
            <p>🛠️ Debugging: 必死の努力</p>
            <p>デバッグ・テストはマジ大変だかんねo(*｀ω´*)o</p>
            <p>なお、今回は手抜きの模様</p>
            <br><br><br><br><br><br><br>
            <p>🎭 Idea: 川口 遥生 と AIの仲間たち</p>
            <p>便利になった世の中だよ、、(つД｀)ﾊｱ</p>
            <br><br><br><br><br><br><br>
            <p>🏗️ Production: Made with Passion</p>
            <p>そこにあるのは気合と根性</p>
            <br><br><br><br><br><br><br>
            <p>⏳ Total Development Time: 約 20 時間</p>
            <p>2/9の深夜12時に思い立ったのさ</p>
            <br><br><br><br><br><br><br>
            <p>💻 Coding: 30%（バグ込み）</p>
            <p>バグはあるもんだ。探してみんしゃい。</p>
            <br><br><br><br><br><br><br>
            <p>🎨 Design: 30%（写真・動画）</p>
            <p>最近canvaっていうデザインツール慣れてきて</p>
            <p>多少は楽になったかも？月額は払わん。</p>
            <p>まだ無料ユーザーでいけると思っている口</p>
            <br><br><br><br><br><br><br>
            <p>🔍 Debugging: 20%（バグ取りより発生の方が多かった）</p>
            <p>直すより見つける方が大変なのよ( ;´-ω-)ハァ-3</p>
            <br><br><br><br><br><br><br>
            <p>🍵 休憩: 15%（サボりじゃない）</p>
            <br><br><br><br><br><br><br>
            <p>📱 SNSチェック: 5%（ちゃんと作業してた）</p>
            <br><br><br><br><br><br><br>
            <p>😇 『ちょっとだけ休むだけのつもりだった』時間: 無限大</p>
            <p>まあ、これが楽しいんだからいいんだけどね</p>
            <br><br><br><br><br><br><br>
            <p>🍳 Food Provider: 玉ねぎ (焼けませんでした)</p>
            <p>もうネタが尽きてきた感あるな</p>
            <br><br><br><br><br><br><br>
            <p>💪 弱い人の値: ${weakValue}</p>
            <p>何回負けたんや…？</p>
            <p>計算方法は死んだ数 × 100やで！</p>
            <br><br><br><br><br><br><br>
            <p>💀 クイズが終わって例の白い箱渡された時、<br>「ああ、死亡エンドか」って思った奴</p>
            <br><br><br><br><br><br><br>
            <p>weak  : 深夜テンションの私のNou</p>
            <br><br><br><br><br><br><br>
            <p>🎁 Thank you for playing!</p>
            <br><br>
            <p>To My Amazing Friend: Thanks for Everything!</p>
            <br><br>
            <p>For All the Laughs, Games, and Memories!</p>
            <br><br>
            <p>Presented by Me & You, 2025.2.10</p>
            <br><br>
            <p>🎉 The End 🎉</p>
            <br><br>
            <p>来年はない。ただの気まぐれである。</p>
            <br><br><br><br><br><br><br><br>
        </div>
    `;
    document.body.appendChild(creditsWrapper);
    setTimeout(() => {
        creditsWrapper.style.animation = "scrollCredits 120s linear forwards";
    }, 2000);

    // 🎥 作業録画の動画（右下）
    let videoWrapper = document.createElement("div");
    videoWrapper.id = "endrollVideoWrapper";
    videoWrapper.innerHTML = `
        <div id="videoContainer">
            <div id="videoLabel">サイト作成中の様子</div>
            <video id="endingVideo" autoplay muted loop>
                <source src="./assets/endroll.mp4" type="video/mp4">
            </video>
        </div>
    `;
    document.body.appendChild(videoWrapper);


    // 🌟 **エンドロール後にフェードアウト**
    setTimeout(() => {
        document.body.style.transition = "opacity 3s ease-out";
        document.body.style.opacity = "0";

        // すべてを削除し、ポップアップを表示
        setTimeout(() => {
            document.body.innerHTML = "";
            document.body.style.opacity = "1";
            displayPopup("(*ﾉ'д｀)おつかれさーん!!", () => {
                location.reload();
            });
        }, 3000);
    }, 123000);
}
