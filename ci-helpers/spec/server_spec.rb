RSpec.describe "application" do
  it "GET / will work" do
    response = get(ENV.fetch('SERVER_ROOT_PATH', '/'))
    expect(response).not_to be_nil
  end
end
