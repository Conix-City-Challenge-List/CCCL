import { round } from './util.js';

// ------------------------------------------------------------------------------------------
// Welcome to the site's configuration! This file allows us to change: 
//      - The formula used anytime the site needs to calculate a score (level, record, and
          // pack scores)
//      - The colors a pack is displayed as
//      - The amount of decimals the site will globally round to and display
// Additionally, notes have been provided to explain exactly what everything does, especially
// to non programmers. Notes are denoted using "//", as seen here.
// ------------------------------------------------------------------------------------------

export const scale = 0; // Amount of decimals the site will globally round to and display.
                        // 0 = whole numbers everywhere points are shown (level points, tier
                        // totals, leaderboard totals). This also affects round()/localize()
                        // site-wide, not just score() below.

// The global rank (1-indexed) at which the main list ends and the Legacy
// list begins. A level ranked 151 or worse no longer earns points, no
// longer accepts new records, and is displayed separately from the
// numbered main list. Matches 15 tiers x 10 challenges each.
export const legacyLimit = 150;

// -------------------------------------
// Score function (levels and records):
// -------------------------------------
export function score(rank, difficulty, percent, minPercent, list) {
    // Legacy levels (fallen off the top `legacyLimit` spots) no longer earn
    // points at all, regardless of difficulty or record percent — so this
    // short-circuits everything else in the function. Guarding here (rather
    // than only at each call site) means every point total across the site
    // — a level's own Points stat, tier totals, and leaderboard totals —
    // automatically excludes legacy levels without needing separate checks
    // everywhere score() gets called.
    if (rank !== null && rank > legacyLimit) {
        return 0;
    }

    // POINTS FUNCTION CONFIGURATION
    // One straight line across every ranked spot: #1 (hardest) is worth
    // maxScore, #legacyLimit (easiest, the very last ranked spot) is worth
    // minScore, and every rank in between is evenly spaced — no more
    // separate per-tier bands or an exponential curve for the harder
    // tiers, just a single simple formula across the whole ranked list.
    const maxScore = 500; // Points awarded to the #1 ranked challenge.
    const minScore = 5;   // Points awarded to the #legacyLimit (last ranked) challenge.

    const decreaseAmount = (maxScore - minScore) / (legacyLimit - 1);
    let baseScore = maxScore - decreaseAmount * (rank - 1);

    // Set minPercent to 100 if the difficulty tier is Hard (4) or below —
    // i.e. Beginner/Easy/Medium/Hard always require a full completion,
    // same rule as before just re-numbered for the 15-tier scale (Hard
    // used to be 3, now it's 4).
    if (difficulty < 5) {
        minPercent = 100;
    }

    // Multiplies the value of score by the factor of the difference between the value of
    // percent and minPercent - 1, divided by the difference between 100 and the value of
    // minPercent - 1.
    baseScore *= ((percent - (minPercent - 1)) / (100 - (minPercent - 1)));

    // Rounds the value of score to the nearest nth decimal, where n is the value of scale,
    // and makes it 0 if the score is negative.
    return Math.max(round(baseScore), 0);
}

// ------------------------
// Score function (packs):
// ------------------------
export function packScore(pack) {
    let packscore = 0; // Initialize packscore

    // For help figuring out how this switch statement works, look at the comments on
    // the switch statement in the score function above.
    //
    // NOTE: 1 (Beginner) - 15 (Impossible) — the list's current 15-tier
    // scale. Extreme (6) and Mythical (7) are deliberately in this order,
    // not alphabetical/intuitive order — Mythical is considered the
    // harder of the two on this list.
    switch (pack.difficulty) { // Set the pack's score based on its difficulty.
        case 1:

            /* Beginner Packs */
            packscore = 10;
            break;
        case 2:

            /* Easy Packs */
            packscore = 25;
            break;
        case 3:

            /* Medium Packs */
            packscore = 50;
            break;
        case 4:

            /* Hard Packs */
            packscore = 75;
            break;
        case 5:

            /* Insane Packs */
            packscore = 100;
            break;
        case 6:

            /* Extreme Packs */
            packscore = 150;
            break;
        case 7:

            /* Mythical Packs */
            packscore = 200;
            break;
        case 8:

            /* Supreme Packs */
            packscore = 300;
            break;
        case 9:

            /* Ethereal Packs */
            packscore = 400;
            break;
        case 10:

            /* Divine Packs */
            packscore = 500;
            break;
        case 11:

            /* Apocalyptic Packs */
            packscore = 600;
            break;
        case 12:

            /* Catastrophic Packs */
            packscore = 700;
            break;
        case 13:

            /* Legendary Packs */
            packscore = 800;
            break;
        case 14:

            /* Silent Packs */
            packscore = 900;
            break;
        case 15:

            /* Impossible Packs */
            packscore = 1000;
            break;
        default:

            /* if the pack's difficulty does not correspond to a "case" above */
            packscore = null;
            break;
    }

    // if the packscore is not "null" (i.e. if the difficulty is not in 
    // the above switch statement), round before returning it.
    return packscore === null ? packscore : round(packscore);
}

// ------------------------
// Dark mode pack colors:
// ------------------------
export function packColor(difficulty) {
    // NOTE: The site uses rgba values for the colors of packs.
    //      - r is the red content of the color.
    //      - g is the green content of the color.
    //      - b is the blue content of the color.
    //      - a is the alpha/opacity of the color (think alpha trigger in Geometry Dash).
    //      - The values of r, g, and b are integers between 0 and 255, inclusive.
    //      - The value of a is a number between 0 and 1, inclusive.

    // If you're not on mobile, an easy way to select and test these values is to open
    // inspect element, click on a pack's button, and find something that looks like this:
    // https://imgur.com/a/6q2MsTj. From there, you're able to change the color in real
    // time (on your device only). When you're done, copy the values from above the color
    // picker and fill them into the switch statement below.

    // Also, keep in mind that these are the values used *while the pack is selected*.
    // If a pack is deselected or the user is only hovering over it, the opacity will
    // decrease.

    // Initialize r, g, b, and a values
    let r = 0;
    let g = 0;
    let b = 0;
    let a = 1; // The site assumes the opacity is 1, unless specified below.

    // For help figuring out how this switch statement works, look at the comments on
    // the switch statement in the score function above.
    //
    // NOTE: same 1 (Beginner) - 15 (Impossible) scale as packScore above — see the note
    // there. Existing tiers (Easy through Silent) kept their exact original colors, just
    // at their new numeric slots — only Beginner, Divine, Apocalyptic, Catastrophic, and
    // Impossible are new colors, picked to be distinct from their neighbors. Feel free to
    // retune any of these to taste.
    switch (difficulty) {
        case 1:

            /* Beginner Packs */
            r = 110;
            g = 190;
            b = 130;
            a = 0.85;
            break;
        case 2:

            /* Easy Packs */
            r = 0;
            g = 53;
            b = 177;
            a = 0.9;
            break;
        case 3:

            /* Medium Packs */
            r = 17;
            g = 137;
            b = 54;
            a = 0.8;
            break;
        case 4:

            /* Hard Packs */
            r = 204;
            g = 209;
            a = 0.8;
            break;
        case 5:

            /* Insane Packs */
            r = 211;
            g = 99;
            a = 0.9;
            break;
        case 6:

            /* Extreme Packs */
            r = 217;
            g = 6;
            b = 6;
            a = 0.9;
            break;
        case 7:

            /* Mythical Packs */
            r = 117;
            g = 13;
            b = 209;
            a = 0.9;
            break;
        case 8:

            /* Supreme Packs */
            r = 255;
            g = 215;
            b = 0;
            a = 0.9;
            break;
        case 9:

            /* Ethereal Packs */
            r = 255;
            g = 105;
            b = 180;
            a = 0.9;
            break;
        case 10:

            /* Divine Packs */
            r = 255;
            g = 240;
            b = 200;
            a = 0.9;
            break;
        case 11:

            /* Apocalyptic Packs */
            r = 180;
            g = 45;
            b = 0;
            a = 0.9;
            break;
        case 12:

            /* Catastrophic Packs */
            r = 120;
            g = 0;
            b = 20;
            a = 0.9;
            break;
        case 13:

            /* Legendary Packs */
            r = 200;
            g = 200;
            b = 200;
            a = 0.8;
            break;
        case 14:

            /* Silent Packs */
            r = 20;
            g = 20;
            b = 20;
            a = 0.9;
            break;
        case 15:

            /* Impossible Packs */
            r = 25;
            g = 0;
            b = 35;
            a = 0.95;
            break;
        default:

            /* If there's a mistake */
            break;
    }
    return [r, g, b, a];
}
