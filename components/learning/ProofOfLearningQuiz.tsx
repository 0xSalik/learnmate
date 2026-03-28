"use client";

import confetti from "canvas-confetti";
import { useMemo, useState } from "react";

type Question = {
    question: string;
    options: string[];
    correctIndex: number;
};

const defaultQuestions: Question[] = [
    {
        question: "Which planet is known as the Red Planet?",
        options: ["Mars", "Venus", "Jupiter", "Mercury"],
        correctIndex: 0,
    },
    {
        question: "What does debit usually represent in assets?",
        options: ["Decrease", "Increase", "Nothing", "Penalty"],
        correctIndex: 1,
    },
    {
        question: "List comprehension in Python replaces what pattern?",
        options: ["Import statement", "Loop + append", "Class inheritance", "Exception handling"],
        correctIndex: 1,
    },
];

export function ProofOfLearningQuiz({ questions = defaultQuestions }: { questions?: Question[] }) {
    const [index, setIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [done, setDone] = useState(false);

    const current = questions[index];

    const passed = useMemo(() => score >= 2, [score]);

    function answer(selected: number) {
        const nextScore = score + (selected === current.correctIndex ? 1 : 0);
        setScore(nextScore);
        if (index === questions.length - 1) {
            setDone(true);
            if (nextScore >= 2) {
                confetti({ particleCount: 120, spread: 90 });
            }
            return;
        }
        setIndex((v) => v + 1);
    }

    if (done) {
        return (
            <div className="rounded-3xl bg-white p-6 text-center">
                <h2 className="text-2xl font-semibold text-(--text-primary)">{passed ? "I built this myself ✓" : "Great attempt!"}</h2>
                <p className="mt-2 text-(--text-secondary)">Score: {score}/3</p>
            </div>
        );
    }

    return (
        <div className="rounded-3xl bg-white p-6">
            <p className="text-sm text-(--text-secondary)">Question {index + 1} of {questions.length}</p>
            <h2 className="mt-2 text-2xl font-semibold text-(--text-primary)">{current.question}</h2>
            <div className="mt-5 grid gap-3">
                {current.options.map((option, i) => (
                    <button
                        key={option}
                        onClick={() => answer(i)}
                        className="rounded-xl border border-(--border-subtle) bg-(--surface-warm) px-4 py-3 text-left text-(--text-primary)"
                    >
                        {option}
                    </button>
                ))}
            </div>
        </div>
    );
}
