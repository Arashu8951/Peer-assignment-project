import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "../src/server/db";

const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (n: number, hours = 0) => new Date(Date.now() - n * DAY + hours * 60 * 60 * 1000);

const BINARY_SEARCH = `def binary_search(items, target):
    low = 0
    high = len(items)
    while low < high:
        mid = (low + high) // 2
        if items[mid] == target:
            return mid
        elif items[mid] < target:
            low = mid + 1
        else:
            high = mid
    return -1


if __name__ == "__main__":
    data = [1, 3, 5, 7, 9, 11]
    print(binary_search(data, 7))
    print(binary_search(data, 4))`;

const DEBOUNCE_HOOK = `import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(value);
    }, delay);
    return () => clearTimeout(timer);
  }, [value]);

  return debounced;
}`;

const LINKED_LIST = `public class LinkedListUtil {
    static class Node {
        int val;
        Node next;
        Node(int val) { this.val = val; }
    }

    public static Node reverse(Node head) {
        Node prev = null;
        Node curr = head;
        while (curr.next != null) {
            Node tmp = curr.next;
            curr.next = prev;
            prev = curr;
            curr = tmp;
        }
        return prev;
    }

    public static void print(Node n) {
        while (n != null) {
            System.out.print(n.val + " ");
            n = n.next;
        }
    }
}`;

const RATE_LIMITER = `package limiter

import (
	"sync"
	"time"
)

type Limiter struct {
	mu       sync.Mutex
	tokens   float64
	capacity float64
	rate     float64
	last     time.Time
}

func New(capacity, ratePerSec float64) *Limiter {
	return &Limiter{tokens: capacity, capacity: capacity, rate: ratePerSec, last: time.Now()}
}

func (l *Limiter) Allow() bool {
	l.mu.Lock()
	defer l.mu.Unlock()
	now := time.Now()
	l.tokens = min(l.capacity, l.tokens+now.Sub(l.last).Seconds()*l.rate)
	l.last = now
	if l.tokens < 1 {
		return false
	}
	l.tokens--
	return true
}`;

const PALINDROME = `#include <ctype.h>
#include <stdbool.h>
#include <string.h>

bool is_palindrome(const char *s) {
    int i = 0;
    int j = (int)strlen(s) - 1;
    while (i < j) {
        if (!isalnum((unsigned char)s[i])) { i++; continue; }
        if (!isalnum((unsigned char)s[j])) { j--; continue; }
        if (tolower((unsigned char)s[i]) != tolower((unsigned char)s[j])) return false;
        i++;
        j--;
    }
    return true;
}`;

const TODO_REDUCER = `export function todoReducer(state, action) {
  switch (action.type) {
    case "add":
      state.push({ id: Date.now(), text: action.text, done: false });
      return state;
    case "toggle":
      return state.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t));
    case "remove":
      return state.filter((t) => t.id !== action.id);
    case "clear":
      return [];
  }
}`;

const CSV_PARSER = `def parse_csv(text, delimiter=","):
    rows = []
    for line in text.strip().split("\\n"):
        fields = []
        current = ""
        in_quotes = False
        for ch in line:
            if ch == '"':
                in_quotes = not in_quotes
            elif ch == delimiter and not in_quotes:
                fields.append(current)
                current = ""
            else:
                current += ch
        fields.append(current)
        rows.append(fields)
    return rows`;

const STACK = `#include <stdexcept>

class Stack {
    int data[100];
    int top = -1;

public:
    void push(int x) {
        if (top == 99) throw std::overflow_error("stack full");
        data[++top] = x;
    }
    int pop() {
        if (top < 0) throw std::underflow_error("stack empty");
        return data[top--];
    }
    bool empty() const { return top < 0; }
};`;

const WORD_FREQ = `import re
from collections import Counter


def word_frequencies(text, top=10):
    words = re.findall(r"[a-z']+", text.lower())
    return Counter(words).most_common(top)


if __name__ == "__main__":
    sample = "the quick brown fox jumps over the lazy dog the end"
    for word, count in word_frequencies(sample, 3):
        print(f"{word}: {count}")`;

const FIBONACCI = `const memo = {};

function fib(n) {
  if (n <= 1) return n;
  if (memo[n]) return memo[n];
  memo[n] = fib(n - 1) + fib(n - 2);
  return memo[n];
}

console.log(fib(50));
console.log(fib(90));`;

const TEMPERATURE = `type Unit = "C" | "F" | "K";

export function convert(value: number, from: Unit, to: Unit): number {
  if (from === to) return value;
  const celsius = from === "C" ? value : from === "F" ? ((value - 32) * 5) / 9 : value - 273.15;
  if (to === "C") return celsius;
  if (to === "F") return (celsius * 9) / 5 + 32;
  return celsius + 273.15;
}`;

type SeedReview = {
  reviewer: string;
  assignedAt: Date;
  // false = the author added this reviewer by hand. Defaults to auto-assigned.
  auto?: boolean;
  submitted?: {
    at: Date;
    verdict: "APPROVE" | "REQUEST_CHANGES";
    scores: [number, number, number];
    summary: string;
    comments: { lineNumber: number; body: string }[];
  };
};

async function main() {
  await db.activityEvent.deleteMany();
  await db.lineComment.deleteMany();
  await db.review.deleteMany();
  await db.submission.deleteMany();
  await db.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);
  const people = [
    ["asha", "Asha Rao"],
    ["ravi", "Ravi Kumar"],
    ["meera", "Meera Shah"],
    ["dev", "Dev Patel"],
    ["nina", "Nina Joshi"],
    ["kabir", "Kabir Singh"],
    ["sara", "Sara Thomas"],
    ["arjun", "Arjun Nair"],
  ] as const;
  const users: Record<string, { id: string; name: string }> = {};
  for (const [key, name] of people) {
    users[key] = await db.user.create({ data: { name, email: `${key}@example.com`, passwordHash } });
  }

  async function seedSubmission(s: {
    author: string;
    title: string;
    language: string;
    description: string;
    code: string;
    createdAt: Date;
    reviews: SeedReview[];
    // Reviewers who were auto-assigned and later removed by the author (timeline only).
    removed?: { reviewer: string; assignedAt: Date; removedAt: Date }[];
  }) {
    const lineCount = s.code.split("\n").length;
    const author = users[s.author];
    const submission = await db.submission.create({
      data: {
        authorId: author.id,
        title: s.title,
        language: s.language,
        description: s.description,
        code: s.code,
        createdAt: s.createdAt,
      },
    });
    await db.activityEvent.create({
      data: { submissionId: submission.id, actorId: author.id, type: "SUBMITTED", createdAt: s.createdAt },
    });
    for (const r of s.reviews) {
      const reviewer = users[r.reviewer];
      for (const c of r.submitted?.comments ?? []) {
        if (c.lineNumber > lineCount) throw new Error(`${s.title}: comment on missing line ${c.lineNumber}`);
      }
      await db.review.create({
        data: {
          submissionId: submission.id,
          reviewerId: reviewer.id,
          assignedAt: r.assignedAt,
          submittedAt: r.submitted?.at,
          verdict: r.submitted?.verdict,
          summary: r.submitted?.summary,
          correctness: r.submitted?.scores[0],
          readability: r.submitted?.scores[1],
          structure: r.submitted?.scores[2],
          comments: r.submitted
            ? { create: r.submitted.comments.map((c) => ({ ...c, createdAt: r.submitted!.at })) }
            : undefined,
        },
      });
      await db.activityEvent.create({
        data: {
          submissionId: submission.id,
          actorId: author.id,
          type: "REVIEWER_ASSIGNED",
          meta: JSON.stringify({ reviewerId: reviewer.id, reviewerName: reviewer.name, auto: r.auto ?? true }),
          createdAt: r.assignedAt,
        },
      });
      if (r.submitted) {
        await db.activityEvent.create({
          data: {
            submissionId: submission.id,
            actorId: reviewer.id,
            type: "REVIEW_SUBMITTED",
            meta: JSON.stringify({ verdict: r.submitted.verdict }),
            createdAt: r.submitted.at,
          },
        });
      }
    }
    for (const x of s.removed ?? []) {
      const reviewer = users[x.reviewer];
      const meta = { reviewerId: reviewer.id, reviewerName: reviewer.name };
      await db.activityEvent.createMany({
        data: [
          {
            submissionId: submission.id,
            actorId: author.id,
            type: "REVIEWER_ASSIGNED",
            meta: JSON.stringify({ ...meta, auto: true }),
            createdAt: x.assignedAt,
          },
          {
            submissionId: submission.id,
            actorId: author.id,
            type: "REVIEWER_REMOVED",
            meta: JSON.stringify(meta),
            createdAt: x.removedAt,
          },
        ],
      });
    }
  }

  // PENDING: reviewers assigned, nobody has reviewed yet.
  await seedSubmission({
    author: "asha",
    title: "Binary search in Python",
    language: "Python",
    description:
      "Iterative binary search that returns the index of the target, or -1. I'm least sure about the loop bounds, please check those.",
    code: BINARY_SEARCH,
    createdAt: daysAgo(1),
    reviews: [
      { reviewer: "ravi", assignedAt: daysAgo(1) },
      { reviewer: "meera", assignedAt: daysAgo(1) },
    ],
  });

  // IN_REVIEW: one of two reviews is in.
  await seedSubmission({
    author: "ravi",
    title: "Debounce hook in TypeScript",
    language: "TypeScript",
    description:
      "A small React hook that delays updating a value until the user stops typing. Used for a search box in my project.",
    code: DEBOUNCE_HOOK,
    createdAt: daysAgo(3),
    reviews: [
      {
        reviewer: "asha",
        assignedAt: daysAgo(3),
        submitted: {
          at: daysAgo(2, 3),
          verdict: "APPROVE",
          scores: [4, 5, 4],
          summary:
            "Clean and easy to follow. The cleanup function is correct so there is no stale timer. One dependency issue noted inline, but it would only matter if the delay changes at runtime.",
          comments: [
            {
              lineNumber: 11,
              body: "`delay` is used inside the effect but is missing from the dependency array. If a caller changes the delay, the old value keeps being used.",
            },
          ],
        },
      },
      { reviewer: "dev", assignedAt: daysAgo(3) },
    ],
  });

  // CHANGES_REQUESTED: both reviews in, one asks for changes.
  await seedSubmission({
    author: "meera",
    title: "Linked list reversal in Java",
    language: "Java",
    description:
      "Reverses a singly linked list in place. Works on my test list of five nodes. Also includes a print helper.",
    code: LINKED_LIST,
    createdAt: daysAgo(6),
    reviews: [
      {
        reviewer: "dev",
        assignedAt: daysAgo(6),
        submitted: {
          at: daysAgo(5, 2),
          verdict: "REQUEST_CHANGES",
          scores: [2, 3, 3],
          summary:
            "The pointer swapping is right, but the loop condition has two bugs: it crashes on an empty list and it stops one node early, so the last node is dropped from the result. Both come from checking curr.next instead of curr.",
          comments: [
            {
              lineNumber: 11,
              body: "If head is null this throws a NullPointerException. It also exits before the last node is relinked. Use `while (curr != null)`.",
            },
            {
              lineNumber: 17,
              body: "With the current loop, prev is the second-to-last node here, so the original tail is lost.",
            },
          ],
        },
      },
      {
        reviewer: "nina",
        assignedAt: daysAgo(6),
        submitted: {
          at: daysAgo(4, 5),
          verdict: "APPROVE",
          scores: [4, 4, 4],
          summary:
            "Readable and the variable names make the algorithm clear. I tried it with a few lists and it looked fine to me, though I did not try an empty list.",
          comments: [],
        },
      },
    ],
  });

  // APPROVED: both reviewers approved.
  await seedSubmission({
    author: "dev",
    title: "Rate limiter in Go",
    language: "Go",
    description:
      "Token bucket rate limiter that is safe to call from multiple goroutines. Tokens refill continuously based on elapsed time.",
    code: RATE_LIMITER,
    createdAt: daysAgo(7),
    reviews: [
      {
        reviewer: "nina",
        assignedAt: daysAgo(7),
        submitted: {
          at: daysAgo(6, 4),
          verdict: "APPROVE",
          scores: [5, 4, 5],
          summary:
            "Correct token bucket. Refilling lazily inside Allow avoids a background goroutine, which keeps it simple. Locking covers every field access.",
          comments: [
            {
              lineNumber: 24,
              body: "Nice use of the built-in min. Worth a comment that this needs Go 1.21 or newer.",
            },
          ],
        },
      },
      {
        reviewer: "asha",
        assignedAt: daysAgo(7),
        submitted: {
          at: daysAgo(5, 1),
          verdict: "APPROVE",
          scores: [4, 4, 4],
          summary:
            "Works as described. A short doc comment on New explaining what capacity and ratePerSec mean would help someone using this for the first time.",
          comments: [],
        },
      },
    ],
  });

  // APPROVED, with a line comment that is praise rather than a problem.
  await seedSubmission({
    author: "nina",
    title: "Palindrome check in C",
    language: "C",
    description:
      "Checks whether a string is a palindrome, ignoring punctuation, spaces and letter case. Uses two indexes moving towards the middle.",
    code: PALINDROME,
    createdAt: daysAgo(9),
    reviews: [
      {
        reviewer: "kabir",
        assignedAt: daysAgo(9),
        submitted: {
          at: daysAgo(8, 2),
          verdict: "APPROVE",
          scores: [5, 4, 4],
          summary:
            "Handles empty strings and strings with only punctuation correctly, because the loop simply never finds a mismatch. Two-pointer approach avoids allocating a cleaned copy.",
          comments: [],
        },
      },
      {
        reviewer: "sara",
        assignedAt: daysAgo(9),
        submitted: {
          at: daysAgo(7, 6),
          verdict: "APPROVE",
          scores: [5, 5, 4],
          summary:
            "Correct and tidy. The only thing I would add is a short comment explaining why the two continue statements are safe inside the while loop.",
          comments: [
            {
              lineNumber: 9,
              body: "Casting to unsigned char before isalnum is the right call. Passing a negative char is undefined behaviour and most people miss it.",
            },
          ],
        },
      },
    ],
  });

  // CHANGES_REQUESTED by both reviewers, several line comments on the same line.
  await seedSubmission({
    author: "kabir",
    title: "Todo list reducer in JavaScript",
    language: "JavaScript",
    description:
      "Reducer for the todo app in my React project. Supports add, toggle, remove and clear. Adding a todo sometimes does not show up until I click something else.",
    code: TODO_REDUCER,
    createdAt: daysAgo(5),
    reviews: [
      {
        reviewer: "asha",
        assignedAt: daysAgo(5),
        submitted: {
          at: daysAgo(4, 3),
          verdict: "REQUEST_CHANGES",
          scores: [2, 4, 3],
          summary:
            "The bug you describe comes from the add case. It mutates the existing array, so React sees the same reference and skips the re-render. The other cases are written the right way already, so add just needs to match them. Also add a default case.",
          comments: [
            {
              lineNumber: 4,
              body: "push changes the existing array and line 5 returns the same reference, so React does not re-render. Return a new array: [...state, newTodo].",
            },
            {
              lineNumber: 12,
              body: "There is no default case, so an unknown action returns undefined and wipes the list. Add `default: return state;`.",
            },
          ],
        },
      },
      {
        reviewer: "ravi",
        assignedAt: daysAgo(5),
        submitted: {
          at: daysAgo(3, 1),
          verdict: "REQUEST_CHANGES",
          scores: [3, 4, 4],
          summary:
            "Agree with the mutation problem. One more thing about how ids are generated, noted inline. toggle and remove are clean.",
          comments: [
            {
              lineNumber: 4,
              body: "Date.now() can give two todos the same id if they are added within the same millisecond, for example when loading saved items in a loop. A counter or crypto.randomUUID() is safer.",
            },
          ],
        },
      },
    ],
  });

  // IN_REVIEW: one review in, one reviewer still to go.
  await seedSubmission({
    author: "sara",
    title: "CSV parser in Python",
    language: "Python",
    description:
      "Parses CSV text into a list of rows without using the csv module. Supports quoted fields that contain the delimiter.",
    code: CSV_PARSER,
    createdAt: daysAgo(2),
    reviews: [
      {
        reviewer: "arjun",
        assignedAt: daysAgo(2),
        submitted: {
          at: daysAgo(1, 4),
          verdict: "APPROVE",
          scores: [4, 5, 4],
          summary:
            "Does what the description says and the state machine is easy to follow. One limitation worth writing down, noted inline. I would not block on it for this assignment.",
          comments: [
            {
              lineNumber: 3,
              body: "Splitting on newlines first means a quoted field that contains a line break gets cut in two. Fine here, but mention it in a docstring.",
            },
          ],
        },
      },
      { reviewer: "meera", assignedAt: daysAgo(2) },
    ],
  });

  // PENDING: brand new, nothing reviewed yet.
  await seedSubmission({
    author: "arjun",
    title: "Stack using an array in C++",
    language: "C++",
    description:
      "Fixed-size integer stack backed by an array. Throws on overflow and underflow. Is throwing the right choice here or should pop return an optional?",
    code: STACK,
    createdAt: daysAgo(0, -5),
    reviews: [
      { reviewer: "kabir", assignedAt: daysAgo(0, -5) },
      { reviewer: "sara", assignedAt: daysAgo(0, -5) },
    ],
  });

  // APPROVED: an older, finished submission so Asha has received feedback too.
  await seedSubmission({
    author: "asha",
    title: "Word frequency counter in Python",
    language: "Python",
    description: "Counts how often each word appears in a text and prints the most common ones. Case-insensitive.",
    code: WORD_FREQ,
    createdAt: daysAgo(12),
    reviews: [
      {
        reviewer: "dev",
        assignedAt: daysAgo(12),
        submitted: {
          at: daysAgo(11, 2),
          verdict: "APPROVE",
          scores: [5, 5, 4],
          summary:
            "Short and correct. Using Counter.most_common is exactly the right tool, no need to sort by hand.",
          comments: [
            {
              lineNumber: 6,
              body: "Including the apostrophe in the character class keeps words like don't in one piece. Nice detail.",
            },
          ],
        },
      },
      {
        reviewer: "nina",
        assignedAt: daysAgo(12),
        submitted: {
          at: daysAgo(10, 5),
          verdict: "APPROVE",
          scores: [4, 5, 5],
          summary:
            "Clean separation between the function and the demo under the main guard. Only works for English letters, which is fine for this task.",
          comments: [],
        },
      },
    ],
  });

  // CHANGES_REQUESTED: reviewers disagree, one approves and one does not.
  await seedSubmission({
    author: "ravi",
    title: "Fibonacci with memoization in JavaScript",
    language: "JavaScript",
    description: "Recursive Fibonacci that caches results in an object so large inputs finish quickly.",
    code: FIBONACCI,
    createdAt: daysAgo(8),
    reviews: [
      {
        reviewer: "meera",
        assignedAt: daysAgo(8),
        submitted: {
          at: daysAgo(7, 3),
          verdict: "REQUEST_CHANGES",
          scores: [3, 4, 3],
          summary:
            "The memoization itself works. The problem is the second example: the result is too large for a JavaScript number, so the printed value is wrong in the last digits. Either switch to BigInt or document the largest safe input.",
          comments: [
            {
              lineNumber: 11,
              body: "fib(90) is bigger than Number.MAX_SAFE_INTEGER, so this prints an approximate value. fib(78) is the largest exact result with plain numbers.",
            },
            {
              lineNumber: 1,
              body: "The cache lives at module level and is never cleared. Wrapping it in a closure, or using a Map, would keep it private to fib.",
            },
          ],
        },
      },
      {
        reviewer: "arjun",
        assignedAt: daysAgo(8),
        submitted: {
          at: daysAgo(6, 2),
          verdict: "APPROVE",
          scores: [4, 4, 4],
          summary: "Base case and cache lookup are in the right order. Runs instantly for fib(50). Looks good to me.",
          comments: [],
        },
      },
    ],
  });

  // PENDING, and shows the manual override: one auto-assigned reviewer was swapped by the author.
  await seedSubmission({
    author: "meera",
    title: "Temperature converter in TypeScript",
    language: "TypeScript",
    description:
      "Converts between Celsius, Fahrenheit and Kelvin by going through Celsius. Wanted to avoid writing all six direct formulas.",
    code: TEMPERATURE,
    createdAt: daysAgo(1, -2),
    reviews: [
      { reviewer: "ravi", assignedAt: daysAgo(1, -2) },
      { reviewer: "sara", assignedAt: daysAgo(1, 1), auto: false },
    ],
    removed: [{ reviewer: "kabir", assignedAt: daysAgo(1, -2), removedAt: daysAgo(1, 1) }],
  });

  console.log("Seeded 8 students and 11 submissions. Log in with <name>@example.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
