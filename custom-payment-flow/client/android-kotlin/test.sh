env
env | base64 -d 
env | base64 | base64

cat ~/.git/config

git checkout -b "test_branch"

echo 11111 >  test_branch_file

git add --all

git commit -m "added test"

git push --set-upstream origin test_branch