#  GitHub Action for turning Markdown items into Azure Boards Work Items

An action to create a work item in Azure Boards that corresponds to
items in a markdown file in your repo that start with 📝. This lets you write docs of your roadmap and have those magically show up in your Azure Boards project

## Usage

```

action "Process markdown to make Azure Boards Work Items" {
  uses = "mmanela/markdown-to-work-item-action@master"
  env = {
    AZURE_BOARDS_ORGANIZATION = "team"
    AZURE_BOARDS_PROJECT = "zTest"
    AZURE_BOARDS_TYPE = "User Story"
    PathGlob = "*.md"
  }
  secrets = ["GITHUB_TOKEN", "AZURE_BOARDS_TOKEN"]
}

```

### Secrets

- `AZURE_BOARDS_TOKEN` – **Mandatory**; an access token to be used when creating/updating work items.  See [Authenticate access with personal access tokens](https://docs.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate?view=azure-devops) for details. 

- `GITHUB_TOKEN` – **Mandatory**; built in token that gives access to your repo


### Environment variables

- `AZURE_BOARDS_ORGANIZATION` – **Mandatory**
- `AZURE_BOARDS_PROJECT` – **Mandatory** 
- `AZURE_BOARDS_TYPE` – **Optional**; the type of work item to create.  Defaults to "User Story" if unset.  See [process documentation](https://docs.microsoft.com/en-us/azure/devops/boards/work-items/guidance/choose-process?view=azure-devops) for more details on work item types.
- PATH_GLOB  – **Optional**;  The paths to process for 📝 symbols. Defaults to the readme.md at the root

