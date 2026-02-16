g = gbt.Game.new_tree(
    players=["Alice", "Bob"],
    title="Stripped-Down Poker: a simple game of one-card poker from Reiley et al (2008).",
)

g.append_move(
    g.root,
    player=g.players.chance,
    actions=["King", "Queen"],  # By default, chance actions have equal probabilities
)

for node in g.root.children:
    g.append_move(node, player="Alice", actions=["Bet", "Fold"])

g.append_move(
    [
        g.root.children["King"].children["Bet"],
        g.root.children["Queen"].children["Bet"],
    ],
    player="Bob",
    actions=["Call", "Fold"],
)

win_big = g.add_outcome([2, -2], label="Win Big")
win = g.add_outcome([1, -1], label="Win")
lose_big = g.add_outcome([-2, 2], label="Lose Big")
lose = g.add_outcome([-1, 1], label="Lose")

# Alice folds, Bob wins small
g.set_outcome(
    g.root.children["King"].children["Fold"], lose
)
g.set_outcome(
    g.root.children["Queen"].children["Fold"], lose
)

# Bob sees Alice Bet and calls, correctly believing she is bluffing, Bob wins big
g.set_outcome(
    g.root.children["Queen"].children["Bet"].children["Call"], lose_big
)

# Bob sees Alice Bet and calls, incorrectly believing she is bluffing, Alice wins big
g.set_outcome(
    g.root.children["King"].children["Bet"].children["Call"], win_big
)

# Bob does not call Alice's Bet, Alice wins small
g.set_outcome(
    g.root.children["King"].children["Bet"].children["Fold"], win
)
g.set_outcome(
    g.root.children["Queen"].children["Bet"].children["Fold"], win
)
