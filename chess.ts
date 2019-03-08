import * as chalk from "chalk";
import { uniq } from "lodash";
import { Chess, Square } from 'chess.js';

let game = new Chess();

function restart(initialFen: string|undefined = undefined) {
    game = new Chess(initialFen);
}

function getCastleSquares(move: "O-O-O" | "O-O"): Square[] {
    if (move === "O-O") {
        if(game.turn() === 'w') {
            return ["e1", "f1", "g1", "h1"];
        }
        return ["e8", "f8", "g8", "h8"];
    }
    if (move === "O-O-O") {
        if(game.turn() === 'w') {
            return ["a1", "c1", "d1", "e1"];
        }
        return ["a8", "c8", "d8", "e8"];
    }
    return [];
}

function getMoveSquares(move: string): Square[] {
    if (move === "O-O" || move === "O-O-O") {
        return getCastleSquares(move);
    }
    const valid = "abcdefgh12345678".split("");
    const square = move.replace(/.*x/, "").split("").filter(l => valid.includes(l)).join("");
    if (square.length !== 2) {
        console.log(`Unreliably extracted the square from move "${square}"!`);
        return [square.slice(-2)] as Square[];
    }
    return [square] as Square[];
}

function getMovesTouchingSquares(squares: Square[]) {
    const possibleMoves = game.moves().filter(move => squares.some(s => getMoveSquares(move).includes(s)));
    console.log({ possibleMoves });
    if (possibleMoves.length === 1) {
        return possibleMoves;
    }

    const movedFigures = squares
        .map(square => ({ piece: game.get(square), square: square }))
        .filter(f => f.piece && f.piece.color === game.turn());
    if (movedFigures.length === 0) {
        throw new Error("Looks like no figures have been moved!");
    }
    const line = squares.map(s => s.match(/\d/)![0]);
    const unique = uniq(line);
    const isCastle = unique.length === 1 && (unique[0] === "1" || unique[0] === "8") && movedFigures.length === 4;
    if (isCastle) {
        // possible castle
    } else if (movedFigures.length > 1) {
        throw new Error(`Looks like ${movedFigures.length} figures have been moved: ${movedFigures.map(f => f.square).join(", ")}`);
    }

    return movedFigures.reduce((acc: string[], figure) => {
        return acc.concat(game.moves({ square: figure.square }));
    }, []).filter(move => {
        return squares.some(s => getMoveSquares(move).includes(s));
    });
}

function turn(...squares: Square[]) {
    let possibleMoves = getMovesTouchingSquares(squares);

    if (possibleMoves.length === 0) {
        throw new Error(`Found no possible moves touching squares ${squares.join(", ")}!`);
    }

    possibleMoves = possibleMoves.filter(m => !isNonQueenPromotion(m))
        .filter(m => m !== "O-O" && m !== "O-O-O");

    if (possibleMoves.length > 1) {
        if (squares.length === 4 && possibleMoves.includes("O-O-O")) {
            possibleMoves = ["O-O-O"];
        } else if (squares.length === 4 && possibleMoves.includes("O-O")) {
            possibleMoves = ["O-O-O"];
        } else {
            throw new Error(`Found ${possibleMoves.length} possible moves, ${possibleMoves.join(" , ")}`);
        }
    }

    const move = possibleMoves[0];

    console.log(`Found move: ${chalk.green(move)}`);
    game.move(move);
    return move;
}

function isNonQueenPromotion(move) {
    return move.includes("=") && !move.includes("=Q");
}

function playRandomGame() {
    restart();
    const chess = new Chess();

    while (!chess.game_over()) {
        const moves = chess.moves().filter(move => !isNonQueenPromotion(move));
        const move = moves[Math.floor(Math.random() * moves.length)];

        console.log("FEN before move:", chalk.yellow(chess.fen()));
        console.log("Performing move", move);
        chess.move(move);
        const lastMove = chess.history({ verbose: true }).pop()!;

        let performed;
        if (lastMove.san === "O-O" || lastMove.san === "O-O-O") {
            performed = turn(...getCastleSquares(lastMove.san));
        } else {
            performed = turn(lastMove.from, lastMove.to);
        }

        if (performed !== move) {
            throw new Error("Detected incorrect move, expected " + performed + ", got" + move);
        }
    }
    console.log(chess.pgn());
}

playRandomGame();

// restart("r3k1r1/2p5/7p/pp3Pbb/N2pp2P/1P2P3/1R1P2K1/3R3n b q - 1 38");
// turn("a1", "c1", "d1", "e1");
