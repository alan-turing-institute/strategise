# Create a new extensive-form game with two players: Alice and Bob
g = gbt.Game.new_tree(players=["Alice", "Bob"], title="Coin Doubling Game")

# Alice's first move: she can either "take" the larger pile or "push" the piles to Bob
g.append_move(g.root, "Alice", ["take", "push"])

# If Alice chooses to "take", the game ends with Alice taking 4 coins and Bob taking 1 coin
alice_takes = g.add_outcome([4, 1], label="Alice takes 4 coins")
g.set_outcome(g.root.children[0], alice_takes)

# If Alice chooses to "push", Bob now has a choice: "take" or "push"
g.append_move(g.root.children[1], "Bob", ["take", "push"])

# If Bob chooses to "take", the game ends with Bob taking 8 coins and Alice taking 2 coins
bob_takes = g.add_outcome([2, 8], label="Bob takes 8 coins")
g.set_outcome(g.root.children[1].children[0], bob_takes)

# If Bob chooses to "push", Alice again has a choice: "take" or "push"
g.append_move(g.root.children[1].children[1], "Alice", ["take", "push"])

# If Alice chooses to "take", the game ends with Alice taking 16 coins and Bob taking 4 coins
alice_takes_again = g.add_outcome([16, 4], label="Alice takes 16 coins")
g.set_outcome(g.root.children[1].children[1].children[0], alice_takes_again)

# If Alice chooses to "push", Bob has the final choice: "take" or "push"
g.append_move(g.root.children[1].children[1].children[1], "Bob", ["take", "push"])

# If Bob chooses to "take", the game ends with Bob taking 32 coins and Alice taking 8 coins
bob_takes_final = g.add_outcome([8, 32], label="Bob takes 32 coins")
g.set_outcome(g.root.children[1].children[1].children[1].children[0], bob_takes_final)

# If Bob chooses to "push", the game ends with Alice taking the larger pile (64 coins) and Bob taking the smaller pile (16 coins)
final_push = g.add_outcome([64, 16], label="Final push")
g.set_outcome(g.root.children[1].children[1].children[1].children[1], final_push)
