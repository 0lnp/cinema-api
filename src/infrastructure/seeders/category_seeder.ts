import { Inject, Injectable } from "@nestjs/common";
import { Seeder } from "./seeder";
import { CategoryRepository } from "src/domain/repositories/category_repository";
import { Category } from "src/domain/aggregates/category";

const CATEGORY_HIERARCHY = [
  { name: "Movies", children: ["Now Showing", "Coming Soon", "Classics"] },
  { name: "Events", children: ["Concerts", "Premieres", "Festivals"] },
  { name: "Promotions", children: ["Discounts", "Bundles", "Seasonal"] },
];

@Injectable()
export class CategorySeeder implements Seeder {
  public readonly name = "CategorySeeder";
  public readonly order = 3;

  public constructor(
    @Inject(CategoryRepository.name)
    private readonly categoryRepository: CategoryRepository,
  ) {}

  public async seed(): Promise<void> {
    for (const rootData of CATEGORY_HIERARCHY) {
      const existingRoots = await this.categoryRepository.rootCategories();
      const existingRoot = existingRoots.find((c) => c.name === rootData.name);

      let rootCategory: Category;

      if (existingRoot) {
        console.log(`\t - Skipping root category "${rootData.name}" (already exists)`);
        rootCategory = existingRoot;
      } else {
        const rootId = await this.categoryRepository.nextIdentity();
        rootCategory = Category.createRoot({ id: rootId, name: rootData.name });
        await this.categoryRepository.save(rootCategory);
        console.log(`\t - Created root category: ${rootData.name}`);
      }

      for (const childName of rootData.children) {
        const existingChildren = await this.categoryRepository.childrenOf(
          rootCategory.id,
        );
        const existingChild = existingChildren.find((c) => c.name === childName);

        if (existingChild) {
          console.log(`\t - Skipping child category "${childName}" (already exists)`);
          continue;
        }

        const childId = await this.categoryRepository.nextIdentity();
        const childCategory = Category.createChild({
          id: childId,
          name: childName,
          parentId: rootCategory.id,
          parent: rootCategory,
        });

        await this.categoryRepository.save(childCategory);
        console.log(`\t - Created child category: ${rootData.name} > ${childName}`);
      }
    }
  }
}
