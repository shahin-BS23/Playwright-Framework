# SMB Automation

End-to-end automation test framework for the SMB System using Playwright and TypeScript.

## Overview

This project covers automated testing of role-based access control and employee management features using a scalable Page Object Model, supporting multiple environments and CI/CD integration.

## Built With

- **[Playwright](https://playwright.dev)** - Modern web testing framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[DotEnv](https://github.com/motdotla/dotenv)** - Environment configuration
- **[Faker.js](https://github.com/faker-js/faker)** - Test data generation
- **[Playwright Report Summary](https://github.com/skilbourn/playwright-report-summary)** - Custom reporting

## Project Structure

```
env/                            # Environment configuration files
├── demo.env                   # demo environment settings
└── stage.env                    # stage environment settings
lib/
└── base.fixture.ts            # Shared test fixture and page fixtures
pages/                         # Page Object Model classes
├── common.page.ts             # Common page elements
├── ****.page.ts            
├── ****.page.ts          
├── ****.page.ts     
├── ****.page.ts 
├── ****.page.ts     
├── ****.page.ts        
├── ****.page.ts            
└── ...                     
test_data/                    # Test data files
├── ****.excl
└── ****.json
tests/                        # Test specifications
└── web/
    ├── ****/
    │   ├── 1. ****.spec.ts
    │   ├── 2. ****.spec.ts
    │   └── 3. ****.spec.ts
    └── ****/
        └── 1. ****.spec.ts
utils/
├── env.ts                    # Environment variable accessors
├── global-setup.ts           # Loads env/<name>.env via DotEnv
├── Utility.ts                # Common utilities
└── ExcelCsvReader.ts         # Excel/CSV file reader utility
playwright.config.ts          # Playwright configuration
package.json                  # Project dependencies and scripts
```

## Prerequisites

- **Node.js** (v20 or higher) - Download from [nodejs.org](https://nodejs.org/en/download/)
- **npm** (v9.5.1 or higher)

## Installation

1. **Clone the repository**
   ```sh
   git clone <repository-url>
   cd SMBAutomation
   ```

2. **Install dependencies**
   ```sh
   npm install
   ```

3. **Install Playwright browsers**
   ```sh
   npx playwright install --with-deps
   ```

## Environment Configuration

The project supports multiple environments via `.env` files in the `env/` directory and CI/CD environment variables.

### Available Environments
- **Stage** - Stage development
- **demo** - demo

### Environment Variables

The project requires `.env` files in the `env/` directory for different environments. Create the following files:

1. `env/Stage.env` - For Stage development
2. `env/demo.env` - For demo/CI environment

Each environment file should include these variables:

```env
ENVIRONMENT_NAME = ""

BASE_URL = ""

BUSINESS_ADMIN_EMAIL = 
BUSINESS_ADMIN_PASSWORD = 
BUSINESS_NAME = 

SITE_ACCESS_USER_NAME = 
SITE_ACCESS_PASSWORD = 
```

### Environment Setup Instructions

1. **Stage Development**:
   - Create `env/stage.env`
   - Set variables with Stage development values
   - Variables will be loaded when running `npm run env:stage`

2. **CI/CD Environment**:
   - Create `env/demo.env` for demo fallback values
   - Set CI/CD environment variables in your pipeline
   - CI/CD variables take precedence over `.env` files
   - Missing values will fall back to `env/demo.env`

### Variable Loading Priority
1. CI/CD environment variables (highest priority)
2. Environment-specific `.env` file based on `TEST_ENV`
3. Default environment configuration (lowest priority)

These variables are exposed via `utils/env.ts` and can be accessed in tests using convenience accessors like `ENV.SITE_BASE_URL`.

## Usage

### Running Tests

Select which `.env` file to load by setting `TEST_ENV` (or `test_env`), default is `stage`:

```sh
# Stage .env (default)
npx playwright test

# Run tests in Stage environment
npm run env:stage

# Run tests in demo environment
npm run env:demo

# Run tests with coverage
npm run env:stage:cov
npm run env:demo:cov
```

### Running Tests by Tag

Tests can be filtered using tags for selective execution:

```sh
# Run only UserManagement tests
npx playwright test --grep "@user-management"

# Run tests excluding a specific tag
npx playwright test --grep-invert "@user-management"

# Run specific test file
npx playwright test tests/web/UserManagement/1. UserCreateUpdateDeleteTest.spec.ts
```

### Test Execution Details

- **Browser**: Chrome (Desktop)
- **Parallel Execution**: Enabled locally, 1 worker in CI
- **Retries**: 2 retries on failure
- **Timeout**: 2 minutes per test
- **Assertion Timeout**: 1 minute
- **Navigation Timeout**: 3 minutes
- **Headless Mode**: Enabled in CI, disabled locally


## Test Structure

### Page Object Model
The project follows the Page Object Model pattern with classes in the `pages/` directory:
- `common.page.ts` - Shared page elements and methods
- `login.page.ts` - Login page functionality
- `userManagement.page.ts` - User Management page interactions
- `userManagementNewUser.page.ts` - User Management New User form
- `roleManagement.page.ts` - Role Management page
- `dashboard.page.ts` - Dashboard page
- And other page objects for various features

### Test Specifications
Tests are organized in the `tests/web/` directory:

#### Role Management Tests
- **Shadow Role Tests** - Tests for Shadow SBU role permissions
- **Manager Role Tests** - Tests for Manager role functionality
- **Employee Role Tests** - Tests for Employee role functionality

#### User Management Tests
- **User Create, Update, Delete Tests** - Comprehensive CRUD operations for users
  - Individual user creation and deletion
  - User information updates
  - Bulk user operations (create, update, delete)
  - Search, filter, and export functionality
  - Tagged with `@user-management` for selective execution

### Test Data
Test data is stored in multiple formats in the `test_data/` directory:
- **JSON files** - For structured test data (user data, expected results)
- **CSV files** - For bulk operations (user_create.csv, user_update.csv)
- **Excel files** - For Excel report testing
- **Export Data** - For testing data export functionality

### Test Tagging
Tests can be tagged for selective execution:
- `@user-management` - All UserManagement test cases
- Tags can be used with `--grep` flag to run specific test suites

## Configuration

### Playwright Configuration (`playwright.config.ts`)

Key configuration options:
- **Test Matching**: `**.spec.ts` files
- **Parallel Execution**: 1 worker in CI, fully parallel locally
- **Screenshots**: Only on failure (local), off (CI)
- **Traces**: On (local), off (CI)
- **Timeout**: 2 minutes per test
- **Assertion Timeout**: 1 minute
- **Navigation Timeout**: 3 minutes
- **Retries**: 2 retries on failure
- **Reporters**: 
  - Stage: HTML report, custom summary, list
  - CI: JUnit XML, custom summary, GitHub annotations, list

### Browser Support

Currently configured for:
- **Chrome** (Desktop)

Additional browsers can be easily added to the configuration by modifying the `projects` section in `playwright.config.ts`.

## Reporting

The framework provides comprehensive reporting:

1. **HTML Report** - Interactive test results with screenshots and traces
2. **Custom Summary** - Concise test execution summary
3. **JUnit Report** - CI/CD integration (XML format)
4. **Console Output** - Real-time test progress

## CI/CD Integration

### GitHub Actions Workflow

The project includes a GitHub Actions workflow (`.github/workflows/playwright-tests.yml`) for automated test execution:

#### Features
- **Manual Trigger**: Workflow can be manually triggered on the `main` branch
- **Environment Selection**: Choose between `Stage` or `demo` environment
- **Automated Setup**: 
  - Node.js 20 setup with npm dependency caching
  - Playwright browser installation with system dependencies
  - Automatic dependency installation
- **Test Execution**: Runs Playwright tests with CI environment configuration
- **Artifact Upload**: Automatically uploads test results, reports, screenshots, and traces
- **Artifact Retention**: Test artifacts are retained for 30 days
- **Error Handling**: Continues execution even on test failures to ensure artifact collection

#### How to Use GitHub Actions

1. Navigate to the **Actions** tab in your GitHub repository
2. Select **Playwright Tests** workflow
3. Click **Run workflow**
4. Select the test environment (`Stage` or `demo`)
5. Click **Run workflow** to start execution

#### Artifacts

After workflow execution, the following artifacts are available:
- `playwright-test-results` - Contains:
  - HTML test reports
  - JUnit XML reports
  - Custom summary reports
  - Screenshots (if any)
  - Trace files (if any)
  - Test result data

Artifacts can be downloaded from the workflow run page and are retained for 30 days.

### CI/CD Environment Variable Precedence
- CI/CD variables and secrets take precedence over `.env` files. In `utils/global-setup.ts` we call DotEnv with `override: false`, so values already present in the environment are preserved, and missing ones are filled from `env/<TEST_ENV>.env`.
- Set `TEST_ENV=demo` to load `env/demo.env` as fallback values in CI.
- The GitHub Actions workflow automatically sets `CI=true` and `test_env` based on the workflow input.

## Contributing

1. Follow the existing code structure and naming conventions
2. Add appropriate test data for new test cases
3. Update environment configurations as needed
4. Ensure all tests pass before submitting changes

## Troubleshooting

### Common Issues

1. **Browser Installation**: Run `npx playwright install --with-deps` if browsers are missing
2. **Environment Variables**: Ensure `.env` files are properly configured
3. **Timeout Issues**: Adjust timeout values in `playwright.config.ts` if needed

### Debug Mode

For debugging, you can run tests in non-headless mode:
```sh
npx playwright test --headed
```

You can also use Playwright's debug mode:
```sh
npx playwright test --debug
```

### Viewing Test Reports

After test execution, reports are generated in the `playwright-report/` directory:
- **HTML Report**: Opens automatically after test completion (Stage only)
- **Custom Summary**: Available at `playwright-report/custom-summary.txt`
- **JUnit Report**: Available at `playwright-report/result.xml` (CI only)

To view the HTML report manually:
```sh
npx playwright show-report
```

### Trace Files

To view trace files for debugging:
```sh
npx playwright show-trace trace.zip
```

Trace files are available in the `test-results/` directory after test execution.

## License

This project is licensed under the ISC License.
