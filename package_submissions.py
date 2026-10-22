"""
package_submissions.py - Packages the 3 submission ZIP files in /output_final according to output_instruction.md
"""

import os
import shutil
import zipfile

def package_all():
    base_dir = r'g:\projects\micor project with tech sub'
    project_source = os.path.join(base_dir, 'Integrated_MicroProject_FLAT_DAA_COA')
    output_final_dir = os.path.join(base_dir, 'output_final')
    os.makedirs(output_final_dir, exist_ok=True)

    docs_dir = os.path.join(project_source, 'docs')
    screenshots_dir = os.path.join(project_source, 'screenshots')

    submissions = [
        {
            'zip_name': 'GauthamRam_S70_FLAT_MicroProject.zip',
            'report_file': 'FLAT_Report.pdf',
            'alt_report': 'FLAT_Report_GauthamRamS.pdf',
            'subject': 'FLAT'
        },
        {
            'zip_name': 'GauthamRam_S70_DAA_MicroProject.zip',
            'report_file': 'DAA_Report.pdf',
            'alt_report': 'DAA_Report_GauthamRamS.pdf',
            'subject': 'DAA'
        },
        {
            'zip_name': 'GauthamRam_S70_COA_MicroProject.zip',
            'report_file': 'COA_Report.pdf',
            'alt_report': 'COA_Report_GauthamRamS.pdf',
            'subject': 'COA'
        }
    ]

    for sub in submissions:
        zip_path = os.path.join(output_final_dir, sub['zip_name'])
        print(f"Creating {sub['zip_name']}...")

        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
            # 1. Add report pdf at root of ZIP
            report_src = os.path.join(docs_dir, sub['report_file'])
            if os.path.exists(report_src):
                zf.write(report_src, sub['report_file'])
            alt_src = os.path.join(docs_dir, sub['alt_report'])
            if os.path.exists(alt_src):
                zf.write(alt_src, sub['alt_report'])

            # 2. Add README.md at root of ZIP
            readme_src = os.path.join(project_source, 'README.md')
            if os.path.exists(readme_src):
                zf.write(readme_src, 'README.md')

            # 3. Add screenshots folder
            if os.path.exists(screenshots_dir):
                for s in os.listdir(screenshots_dir):
                    s_path = os.path.join(screenshots_dir, s)
                    if os.path.isfile(s_path):
                        zf.write(s_path, os.path.join('screenshots', s))

            # 4. Add complete project source folder
            for root, dirs, files in os.walk(project_source):
                # Skip temp or cache folders if any
                dirs[:] = [d for d in dirs if d not in ['.git', 'node_modules', '__pycache__']]
                for f in files:
                    full_p = os.path.join(root, f)
                    rel_p = os.path.relpath(full_p, base_dir)
                    zf.write(full_p, rel_p)

        file_size = os.path.getsize(zip_path)
        print(f"  -> Created {zip_path} ({file_size} bytes)")

    print("\nAll 3 submission packages successfully generated in /output_final!")

if __name__ == '__main__':
    package_all()
