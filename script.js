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
function playVideo() {
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


    // 動画が終わったら「やり直す？」のポップアップを表示
    video.onended = function () {
        let retryCount = incrementRetryCount() * 100;
        displayPopup(`やり直す（弱い値: ${retryCount})`, () => {
            location.reload(); // 画面をリロード
        });
    };
}

function startGiftOpening() {
    let hp = 10; // HPの初期値
    let damage = 2; // 1クリックごとの減少量

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
            if (hp <= 0) {
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


// 🎁 プレゼント開封イベントを「はい」ボタンに設定
document.getElementById("popupYesBtn").addEventListener("click", function () {
    displayPopup("🎊 プレゼント開封準備中… 🎊", null, false);
    setTimeout(() => {
        startGiftOpening();
    }, 1000);
});

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

function showNextStep() {
    displayPopup("プレゼントを賭けてクイズをしようじゃあないか", () => {
        showQuizPopup("日本で一番高い山は？", "choice", ["富士山", "北岳", "剣岳", "阿蘇山"], "富士山",
            () => {
                displayPopup("さすがに余裕かな？", () => {
                    showQuizPopup("アニメ『花咲くいろは』に出てくる<br>「ホビロン」は、<br>「ほんとに びっくりするほど 何？」", "text", [], "論外",
                        () => {
                            displayPopup("これちょっと怪しかったんやないか？", () => {
                                showQuizPopup("だーれだ？", "picture", [], "中村悠真",
                                    () => {
                                        displayPopup("足湯入った時の写真やな。足のフォルム綺麗すぎる<br>バレリーナかよ", () => {
                                            showQuizPopup("この特徴的なポーズの後ろには何がある？", "picture_choice", ["椅子", "公園", "鳥居", "海"], "椅子",
                                                () => {
                                                    displayPopup("この後、くっそ並んだ後に食べた牛丼は<br>まじでうまかったな", () => {
                                                        showQuizPopup("後ろにあるものはなに？", "picture_choice", ["空", "福岡タワー", "鳥居", "竹林"], "竹林",
                                                            () => {
                                                                displayPopup("正直、撮り方うまいなと思った。<br>早くもこの時期に戻りたいnou。", () => {
                                                                    showQuizPopup("この日の夜に食ったものは？", "picture_choice", ["三日前のカレー", "玉ねぎ", "肉", "親のスネ"], "肉",
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
                                                                displayPopup("些細なものもあげましょう", () => {
                                                                    displayPopup("はい、どうぞ？", () => {
                                                                        startGiftOpening();
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

function showQuizPopup(question, type, options = [], correctAnswer, callback, imageName = null) {
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
            <div class="quiz-options">
                ${options.map((option, i) => `
                    <label class="quiz-option" data-value="${option}">
                        <input type="radio" name="quizOption" value="${option}"> ${option}
                    </label>
                `).join("")}
            </div>
        `;
        inputField += `<br><div class="quiz-image-container">
                <img src="./assets/${imageName}_ques.png" class="quiz-image" alt="誰の写真？">
            </div>
        `;
    }


    popup.innerHTML = `
        <div class="popup-content">
            <h3>❓ クイズ ❓</h3>
            <p>${question}</p>
            <div class="quiz-input">${inputField}</div>
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
            displayPopup("まあ、正直、不正解なんてありえないよね。。", () => {
                playVideo();
            });
        }
    });
}
